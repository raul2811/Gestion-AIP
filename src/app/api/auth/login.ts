import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no definido en las variables de entorno.');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, correo, contrasena, rol, nombre_completo, cedula } = body;

    if (action === 'login') {
      if (!correo || !contrasena) {
        return new NextResponse('Correo y contraseña son requeridos', { status: 400 });
      }

      const user = await prisma.usuarios.findUnique({
        where: { correo },
        include: {
          usuario_roles: { include: { roles: true } },
        },
      });

      if (!user) return new NextResponse('Credenciales inválidas', { status: 401 });

      const contrasenaValida = await bcrypt.compare(contrasena, user.contrasena_hash);
      if (!contrasenaValida) return new NextResponse('Credenciales inválidas', { status: 401 });

      const userRoles = user.usuario_roles.map(ur => ur.roles.nombre_rol);

      const token = jwt.sign(
        { userId: user.id_usuario, roles: userRoles },
        JWT_SECRET,
        { expiresIn: '8h' }
      );

      
      const serializedCookie = serialize('sessionToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 8,
        path: '/',
      });

      return new NextResponse(JSON.stringify({ message: 'Login exitoso', roles: userRoles }), {
        status: 200,
        headers: { 'Set-Cookie': serializedCookie },
      });
    }

    if (action === 'register') {
      if (!correo || !contrasena || !rol || !nombre_completo || !cedula) {
        return new NextResponse('Todos los campos son requeridos para el registro', { status: 400 });
      }

      const existingUser = await prisma.usuarios.findFirst({
        where: {
          OR: [{ correo }, { cedula }],
        },
      });

      if (existingUser) {
        if (existingUser.correo === correo) {
          return new NextResponse('El correo ya está registrado.', { status: 409 });
        }
        if (existingUser.cedula === cedula) {
          return new NextResponse('La cédula ya está registrada.', { status: 409 });
        }
      }

      const roleFound = await prisma.roles.findUnique({
        where: { nombre_rol: rol },
      });

      if (!roleFound) {
        return new NextResponse(`El rol '${rol}' no existe.`, { status: 400 });
      }

      const contrasena_hash = await bcrypt.hash(contrasena, 10);

      const newUser = await prisma.usuarios.create({
        data: {
          nombre_completo,
          correo,
          cedula,
          contrasena_hash,
          estado: "Activo",
        },
      });

      await prisma.usuario_roles.create({
        data: {
          id_usuario: newUser.id_usuario,
          id_rol: roleFound.id_rol,
        },
      });

      return new NextResponse(JSON.stringify({ message: `Usuario registrado con rol ${rol}.`, userId: newUser.id_usuario }), { status: 201 });
    }

    return new NextResponse('Acción no válida', { status: 400 });

  } catch (error) {
    console.error('Error autenticación:', error);
    return new NextResponse('Error interno', { status: 500 });
  }
}
