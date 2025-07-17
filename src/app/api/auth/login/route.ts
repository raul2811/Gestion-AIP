import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('ERROR: JWT_SECRET no está definido en las variables de entorno.');
  throw new Error('Configuración de JWT_SECRET faltante. La aplicación no puede iniciar de forma segura.');
}

export async function POST(request: Request) {
  console.log('--- Nueva Solicitud POST recibida en /api/auth/login ---');
  let body;
  try {
    body = await request.json();
    console.log('Cuerpo de la solicitud JSON parseado con éxito:', body);

    const { action, correo, contrasena, rol, nombre_completo, cedula } = body;

    // --- Lógica para el Inicio de Sesión (Login) ---
    if (action === 'login') {
      console.log('Detectada acción: LOGIN');
      console.log(`Intentando login para correo: ${correo}`);

      if (!correo || !contrasena) {
        console.warn('Login Fallido: Correo o contraseña faltantes.');
        return new NextResponse('Correo y contraseña son requeridos', { status: 400 });
      }

      // 1. Buscar al usuario por correo e incluir su rol
      console.log('Buscando usuario en la base de datos...');
      const user = await prisma.usuarios.findUnique({
        where: { correo },
        include: {
          usuario_roles: {
            include: {
              roles: true,
            },
          },
        },
      });

      if (!user) {
        console.warn(`Login Fallido: Usuario no encontrado para el correo: ${correo}`);
        return new NextResponse('Credenciales inválidas', { status: 401 });
      }
      console.log('Usuario encontrado:', user.id_usuario, user.correo);

      // 2. Comparar la contraseña proporcionada con el hash almacenado
      console.log('Comparando contraseña...');
      const contrasenaValida = await bcrypt.compare(contrasena, user.contrasena_hash);

      if (!contrasenaValida) {
        console.warn('Login Fallido: Contraseña inválida.');
        return new NextResponse('Credenciales inválidas', { status: 401 });
      }
      console.log('Contraseña validada con éxito.');

      // 3. Obtener el nombre del rol del usuario (solo uno)
      const userRol = user.usuario_roles[0]?.roles.nombre_rol;
      console.log('Rol del usuario:', userRol);

      // Si el usuario no tiene rol, responder con 403 y mensaje especial
      if (!userRol) {
        console.warn('Login Fallido: Usuario sin rol asignado.');
        return new NextResponse(
          JSON.stringify({ message: 'Tu cuenta está pendiente de asignación de rol por el administrador.' }),
          { status: 403 }
        );
      }

      // 4. Crear el token JWT con el ID del usuario y su rol
      console.log('Generando token JWT...');
      const token = jwt.sign(
        { userId: user.id_usuario, rol: userRol },
        JWT_SECRET,
        { expiresIn: '8h' }
      );
      console.log('Token JWT generado (solo los primeros 20 chars para depuración):', token.substring(0, 20) + '...');

      // 5. Crear la cookie de sesión segura
      console.log('Serializando cookie de sesión...');
      const serializedCookie = serialize('sessionToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 8,
        path: '/',
      });
      console.log('Cookie serializada:', serializedCookie.substring(0, 50) + '...');

      // 6. Enviar la respuesta exitosa con la cookie y el rol del usuario
      console.log('Login Exitoso: Enviando respuesta 200.');
      return new NextResponse(
      JSON.stringify({
        message: 'Login exitoso',
        rol: userRol,
        nombre_completo: user.nombre_completo 
      }),
      {
        status: 200,
        headers: { 'Set-Cookie': serializedCookie },
      });

    }
    // --- Lógica para el Registro de Usuario (Register) ---
    else if (action === 'register') {
      console.log('Detectada acción: REGISTER');
      console.log(`Intentando registro para correo: ${correo}, cédula: ${cedula}`);

      // SOLO verifica los campos básicos, NO el rol
      if (!correo || !contrasena || !nombre_completo || !cedula) {
        console.warn('Registro Fallido: Campos requeridos faltantes.');
        return new NextResponse('Todos los campos (nombre completo, cédula, correo y contraseña) son requeridos para el registro', { status: 400 });
      }
      console.log('Todos los campos de registro requeridos están presentes.');

      // 1. Verificar si ya existe un usuario con el mismo correo o cédula
      console.log('Verificando si el usuario ya existe...');
      const existingUser = await prisma.usuarios.findFirst({
        where: {
          OR: [{ correo: correo }, { cedula: cedula }],
        },
      });

      if (existingUser) {
        if (existingUser.correo === correo) {
          console.warn(`Registro Fallido: El correo ${correo} ya está registrado.`);
          return new NextResponse('El correo ya está registrado.', { status: 409 });
        }
        if (existingUser.cedula === cedula) {
          console.warn(`Registro Fallido: La cédula ${cedula} ya está registrada.`);
          return new NextResponse('La cédula ya está registrada.', { status: 409 });
        }
      }
      console.log('Correo y cédula no están registrados.');

      // 2. Hashear la contraseña antes de almacenarla por seguridad
      console.log('Hasheando contraseña...');
      const contrasena_hash = await bcrypt.hash(contrasena, 10);
      console.log('Contraseña hasheada con éxito (solo los primeros 20 chars para depuración):', contrasena_hash.substring(0, 20) + '...');

      // 3. Crear el nuevo usuario en la tabla 'usuarios'
      console.log('Creando nuevo usuario en la base de datos...');
      const newUser = await prisma.usuarios.create({
        data: {
          nombre_completo,
          correo,
          cedula,
          contrasena_hash,
          estado: "Activo",
        },
      });
      console.log('Usuario creado en la tabla Usuarios con ID:', newUser.id_usuario);

      // NO asignar rol aquí. El admin lo hará después.

      console.log('Registro Exitoso: Enviando respuesta 201.');
      return new NextResponse(JSON.stringify({ message: `Usuario ${nombre_completo} registrado exitosamente.`, userId: newUser.id_usuario }), { status: 201 });

    } else {
      console.warn('Solicitud Fallida: Acción no válida detectada:', action);
      return new NextResponse('Acción no válida', { status: 400 });
    }

  } catch (error) {
    console.error('--- ERROR GENERAL EN LA OPERACIÓN DE AUTENTICACIÓN ---');
    console.error('Error original:', error);
    console.error('Cuerpo de la solicitud ANTES del parseo exitoso (si aplica):', request);
    if (body) {
      console.error('Cuerpo de la solicitud DESPUÉS del parseo exitoso (si aplica):', body);
    }

    if (error instanceof SyntaxError && error.message.includes('JSON.parse')) {
      console.error('Problema: El cuerpo de la solicitud NO ES JSON válido o está vacío.');
      return new NextResponse('Error en el formato de los datos enviados. Asegúrate de que el cuerpo de la solicitud sea JSON válido.', { status: 400 });
    }
    if (error instanceof Error && error.message.includes('malformed UUID')) {
      console.error('Problema: Se recibió un UUID mal formado en alguna parte de la operación.');
      return new NextResponse('ID de formato incorrecto. Contacta a soporte.', { status: 400 });
    }
    console.error('Error no manejado: Posible problema de base de datos o lógica de negocio. Revisa los logs de Prisma/PostgreSQL.');
    return new NextResponse('Error interno del servidor. Por favor, inténtalo de nuevo más tarde.', { status: 500 });
  }
}