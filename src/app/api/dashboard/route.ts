import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import { auth } from '@/lib/auth';
import {
  getGeneralOverviewData,
  getProjectStatusDistribution,
  getMonthlyFinancialTrend,
  getUsersByRole,
  getTasksByPriorityAndStatus,
  getRoleIdByName,
  getAllUsers
} from '@/lib/queries';

export const dynamic = 'force-dynamic';

// --- GET: Obtener datos para el dashboard ---
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const validRoles = ['administrador', 'maestro'];
    const userRole = typeof session.user.rol === 'string'
      ? session.user.rol.toLowerCase()
      : '';

    if (!validRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const currentYear = new Date().getFullYear();
    const [
      overview,
      projectStatus,
      financialTrend,
      usersByRole,
      tasksByPriorityAndStatus
    ] = await Promise.all([
      getGeneralOverviewData(),
      getProjectStatusDistribution(),
      getMonthlyFinancialTrend(currentYear),
      getUsersByRole(),
      getTasksByPriorityAndStatus()
    ]);

    const allUsers = await getAllUsers();

    return NextResponse.json({
      data: {
        overview,
        projectStatus,
        financialTrend,
        usersByRole,
        tasksByPriorityAndStatus,
        allUsers,
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });

  } catch (error) {
    console.error('Error en GET /api/dashboard:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// --- POST: Crear un nuevo usuario desde el dashboard ---
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const validRoles = ['administrador', 'maestro'];
    const userRole = typeof session.user.rol === 'string'
      ? session.user.rol.toLowerCase()
      : '';

    if (!validRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Acceso no autorizado para crear usuarios' }, { status: 403 });
    }

    const body = await request.json();
    const { nombre_completo, cedula, correo, contrasena, rol, estado } = body;

    if (!nombre_completo || !cedula || !correo || !contrasena || !rol || !estado) {
      return NextResponse.json({ error: 'Todos los campos son requeridos.' }, { status: 400 });
    }

    const existingUser = await prisma.usuarios.findFirst({
      where: { OR: [{ correo }, { cedula }] }
    });
    if (existingUser) {
      return NextResponse.json({ error: 'El correo o la cédula ya existen.' }, { status: 409 });
    }

    const roleId = await getRoleIdByName(rol);
    if (!roleId) {
      return NextResponse.json({ error: `El rol "${rol}" no es válido.` }, { status: 400 });
    }

    const contrasena_hash = await bcrypt.hash(contrasena, 10);

    const newUser = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.usuarios.create({
        data: {
          nombre_completo,
          cedula,
          correo,
          contrasena_hash,
          estado,
        },
      });

      await tx.usuario_roles.create({
        data: {
          id_usuario: createdUser.id_usuario,
          id_rol: roleId,
        },
      });

      return createdUser;
    });

    return NextResponse.json({ message: `Usuario ${nombre_completo} creado correctamente.`, userId: newUser.id_usuario }, { status: 201 });

  } catch (error) {
    console.error('Error en POST /api/dashboard:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}

// --- PUT: Actualizar un usuario existente ---
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const validRoles = ['administrador', 'maestro'];
    const userRole = typeof session.user.rol === 'string'
      ? session.user.rol.toLowerCase()
      : '';

    if (!validRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Acceso no autorizado para modificar usuarios' }, { status: 403 });
    }

    const body = await request.json();
    const { id_usuario, nombre_completo, cedula, correo, rol, estado } = body;

    if (!id_usuario || !nombre_completo || !cedula || !correo || !rol || !estado) {
      return NextResponse.json({ error: 'Todos los campos son requeridos para la actualización.' }, { status: 400 });
    }

    const newRoleId = await getRoleIdByName(rol);
    if (!newRoleId) {
      return NextResponse.json({ error: `El rol "${rol}" no es válido.` }, { status: 400 });
    }

    // LOGS para depuración
    console.log('PUT usuario body:', body);
    console.log('PUT usuario: Rol recibido:', rol, 'ID de rol:', newRoleId);

    const result = await prisma.$transaction(async (tx) => {
      const userUpdate = await tx.usuarios.update({
        where: { id_usuario },
        data: {
          nombre_completo,
          cedula,
          correo,
          estado,
        },
      });

      // Verifica si el usuario ya tiene rol
      const existingRole = await tx.usuario_roles.findFirst({
        where: { id_usuario },
      });

      let roleUpdate;
      if (existingRole) {
        roleUpdate = await tx.usuario_roles.updateMany({
          where: { id_usuario },
          data: { id_rol: newRoleId },
        });
      } else {
        roleUpdate = await tx.usuario_roles.create({
          data: {
            id_usuario,
            id_rol: newRoleId,
          },
        });
      }

      return { userUpdate, roleUpdate };
    });

    console.log('PUT usuario: Resultado transacción:', result);

    return NextResponse.json({ message: 'Usuario actualizado correctamente.' }, { status: 200 });

  } catch (error) {
    console.error('Error en PUT /api/dashboard:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}

// --- DELETE: Eliminar un usuario ---
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'Falta el parámetro userId.' }, { status: 400 });
    }

    // Elimina registros relacionados en auditoria_eventos
    await prisma.auditoria_eventos.deleteMany({
      where: { id_usuario: userId },
    });

    // Elimina otros registros relacionados (ejemplo: archivos, beneficiarios, campanas, etc.)
    await prisma.archivos.deleteMany({ where: { id_usuario_subio: userId } });
    await prisma.beneficiarios.deleteMany({ where: { id_usuario_registra: userId } });
    await prisma.campanas.deleteMany({ where: { id_usuario_responsable: userId } });
    await prisma.documento_firmas.deleteMany({ where: { id_usuario_firmante: userId } });
    await prisma.documento_versiones.deleteMany({ where: { id_usuario_version: userId } });
    await prisma.documentos.deleteMany({ where: { id_usuario_creador: userId } });
    await prisma.notificaciones.deleteMany({ where: { id_usuario_destino: userId } });
    await prisma.proyecto_equipo.deleteMany({ where: { id_usuario: userId } });
    await prisma.proyectos.deleteMany({ where: { id_usuario_creador: userId } });
    await prisma.sesiones_usuario.deleteMany({ where: { id_usuario: userId } });
    await prisma.tarea_asignados.deleteMany({ where: { id_usuario: userId } });
    await prisma.transacciones_financieras.deleteMany({ where: { id_usuario_registro: userId } });
    await prisma.usuario_departamento_puesto.deleteMany({ where: { id_usuario: userId } });

    // Elimina roles primero (si aplica)
    await prisma.usuario_roles.deleteMany({
      where: { id_usuario: userId },
    });

    // Elimina el usuario
    await prisma.usuarios.delete({
      where: { id_usuario: userId },
    });

    return NextResponse.json({ message: 'Usuario eliminado correctamente.' }, { status: 200 });
  } catch (error: any) {
    console.error('Error en DELETE /api/dashboard:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor.' }, { status: 500 });
  }
}

// --- PATCH: Cambiar la contraseña del usuario autenticado ---
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { newPassword } = await request.json();
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' }, { status: 400 });
    }

    const contrasena_hash = await bcrypt.hash(newPassword, 10);

    // Cambia 'id' por 'userId' si tu sesión lo tiene así
    await prisma.usuarios.update({
      where: { id_usuario: session.user.userId }, // <-- aquí el cambio
      data: { contrasena_hash },
    });

    return NextResponse.json({ message: 'Contraseña actualizada correctamente.' }, { status: 200 });
  } catch (error: any) {
    console.error('Error en PATCH /api/dashboard:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor.' }, { status: 500 });
  }
}
