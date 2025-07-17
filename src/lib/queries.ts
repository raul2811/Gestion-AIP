import prisma from './db';

// Helper function to get role ID by name
export async function getRoleIdByName(roleName: string) {
  const role = await prisma.roles.findUnique({
    where: { nombre_rol: roleName },
    select: { id_rol: true },
  });
  return role?.id_rol;
}

// ======================================
// GENERAL QUERIES (For Admin/Maestro Dashboard)
// ======================================

export async function getGeneralOverviewData() {
  const [
    totalProjects,
    activeProjects,
    completedProjectsLastYear,
    totalUsers,
    activeUsers,
    activeSessionsLast24h,
    incomeSum,
    expenseSum,
    totalAssets,
    pendingMaintenances,
  ] = await prisma.$transaction([
    prisma.proyectos.count(),
    prisma.proyectos.count({
      where: {
        estados_proyecto: {
          nombre_estado: 'En Progreso',
        },
      },
    }),
    prisma.proyectos.count({
      where: {
        estados_proyecto: {
          nombre_estado: 'Completado',
        },
        fecha_fin_real: {
          gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
        },
      },
    }),
    prisma.usuarios.count(),
    prisma.usuarios.count({ where: { estado: 'Activo' } }),
    prisma.sesiones_usuario.count({
      where: {
        fecha_inicio: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        exito_login: true,
      },
    }),
    prisma.transacciones_financieras.aggregate({
      _sum: { monto: true },
      where: {
        tipos_transaccion_financiera: { naturaleza: 'Ingreso' },
        fecha_transaccion: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    }),
    prisma.transacciones_financieras.aggregate({
      _sum: { monto: true },
      where: {
        tipos_transaccion_financiera: { naturaleza: 'Gasto' },
        fecha_transaccion: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    }),
    prisma.activos.count(),
    prisma.mantenimientos_activo.count({
      where: {
        fecha_mantenimiento: { gte: new Date() },
      },
    }),
  ]);

  const totalIncomeMonth = incomeSum._sum.monto?.toNumber() || 0;
  const totalExpenseMonth = expenseSum._sum.monto?.toNumber() || 0;

  return {
    totalProjects,
    activeProjects,
    completedProjectsLastYear,
    totalUsers,
    activeUsers,
    activeSessionsLast24h,
    totalIncomeMonth,
    totalExpenseMonth,
    balanceNetMonth: totalIncomeMonth - totalExpenseMonth,
    totalAssets,
    pendingMaintenances,
  };
}

export async function getProjectStatusDistribution() {
  const data = await prisma.proyectos.groupBy({
    by: ['id_estado_proyecto'],
    _count: {
      id_proyecto: true,
    },
    orderBy: {
      _count: {
        id_proyecto: 'desc',
      },
    },
  });

  const statusNames = await prisma.estados_proyecto.findMany({
    select: { id_estado_proyecto: true, nombre_estado: true },
  });
  const statusMap = new Map(statusNames.map(s => [s.id_estado_proyecto, s.nombre_estado]));

  return data.map(item => ({
    name: statusMap.get(item.id_estado_proyecto) || 'Desconocido',
    value: item._count.id_proyecto,
  }));
}

export async function getMonthlyFinancialTrend(year: number) {
  const data = await prisma.$queryRaw`
    SELECT
      TO_CHAR(tf.fecha_transaccion, 'YYYY-MM') AS month,
      SUM(CASE WHEN ttf.naturaleza = 'Ingreso' THEN tf.monto ELSE 0 END)::float AS ingresos,
      SUM(CASE WHEN ttf.naturaleza = 'Gasto' THEN tf.monto ELSE 0 END)::float AS gastos
    FROM "transacciones_financieras" tf
    JOIN "tipos_transaccion_financiera" ttf ON tf.id_tipo_transaccion = ttf.id_tipo_transaccion
    WHERE EXTRACT(YEAR FROM tf.fecha_transaccion) = ${year}
    GROUP BY month
    ORDER BY month ASC;
  `;

  return data as { month: string; ingresos: number; gastos: number }[];
}

export async function getUsersByRole() {
  const data = await prisma.usuario_roles.groupBy({
    by: ['id_rol'],
    _count: {
      id_usuario: true,
    },
    orderBy: {
      _count: {
        id_usuario: 'desc',
      },
    },
  });

  const roleNames = await prisma.roles.findMany({
    select: { id_rol: true, nombre_rol: true },
  });
  const roleMap = new Map(roleNames.map(r => [r.id_rol, r.nombre_rol]));

  return data.map(item => ({
    name: roleMap.get(item.id_rol) || 'Desconocido',
    value: item._count.id_usuario,
  }));
}

export async function getMonthlyUserRegistrations(year: number) {
  const data = await prisma.$queryRaw`
    SELECT
      TO_CHAR(fecha_creacion, 'YYYY-MM') AS month,
      COUNT(id_usuario)::int AS total
    FROM "usuarios"
    WHERE EXTRACT(YEAR FROM fecha_creacion) = ${year}
    GROUP BY month
    ORDER BY month ASC;
  `;

  return data as { month: string; total: number }[];
}

export async function getProjectCreationTrend(year: number) {
  const data = await prisma.$queryRaw`
    SELECT
      TO_CHAR(fecha_inicio_plan, 'YYYY-MM') AS month,
      COUNT(id_proyecto)::int AS total
    FROM "proyectos"
    WHERE EXTRACT(YEAR FROM fecha_inicio_plan) = ${year}
    GROUP BY month
    ORDER BY month ASC;
  `;
  return data as { month: string; total: number }[];
}

/**
 * Obtiene una lista de TODOS los usuarios en el sistema con su rol principal.
 */
export async function getAllUsers() {
  const users = await prisma.usuarios.findMany({
    select: {
      id_usuario: true,
      nombre_completo: true,
      correo: true,
      cedula: true,
      estado: true,
      usuario_roles: {
        select: {
          roles: {
            select: {
              nombre_rol: true,
            },
          },
        },
      },
    },
    orderBy: {
      nombre_completo: 'asc',
    },
  });

  // Mapeo defensivo para frontend
  return users.map(user => ({
    id: user.id_usuario ?? '',
    name: user.nombre_completo ?? '',
    email: user.correo ?? '',
    cedula: user.cedula ?? '',
    status: user.estado ?? '',
    role: user.usuario_roles?.[0]?.roles?.nombre_rol ?? 'Sin rol',
  }));
}

export async function getTasksByPriorityAndStatus() {
  const data = await prisma.tareas.groupBy({
    by: ['id_prioridad_tarea', 'id_estado_tarea'],
    _count: {
      id_tarea: true,
    },
    orderBy: [{ id_prioridad_tarea: 'asc' }, { id_estado_tarea: 'asc' }],
  });

  const priorityNames = await prisma.prioridades_tarea.findMany({
    select: { id_prioridad_tarea: true, nombre_prioridad: true },
  });
  const priorityMap = new Map(priorityNames.map(p => [p.id_prioridad_tarea, p.nombre_prioridad]));

  const statusNames = await prisma.estados_tarea.findMany({
    select: { id_estado_tarea: true, nombre_estado: true },
  });
  const statusMap = new Map(statusNames.map(s => [s.id_estado_tarea, s.nombre_estado]));

  const result: { [key: string]: any } = {};
  data.forEach(item => {
    const priorityName = priorityMap.get(item.id_prioridad_tarea) || 'Desconocido';
    const statusName = statusMap.get(item.id_estado_tarea) || 'Desconocido';
    if (!result[priorityName]) {
      result[priorityName] = { name: priorityName };
    }
    result[priorityName][statusName] = item._count.id_tarea;
  });

  return Object.values(result);
}

// ======================================
// QUERIES FOR PROJECT MANAGER DASHBOARD
// ======================================

export async function getProjectManagerOverview(userId: string) {
  const projects = await prisma.proyectos.findMany({
    where: {
      OR: [
        { id_usuario_creador: userId },
        {
          proyecto_equipo: {
            some: {
              id_usuario: userId,
            },
          },
        },
      ],
    },
    include: {
      estados_proyecto: { select: { nombre_estado: true } },
    },
  });

  const activeProjectsCount = projects.filter(p => p.estados_proyecto?.nombre_estado === 'En Progreso').length;
  const overdueProjects = projects.filter(p =>
    p.fecha_fin_plan && p.fecha_fin_plan < new Date() && p.estados_proyecto?.nombre_estado !== 'Completado'
  ).length;

  const tasksInMyProjects = await prisma.tareas.count({
    where: {
      id_proyecto: {
        in: projects.map(p => p.id_proyecto),
      },
      estados_tarea: {
        nombre_estado: 'Pendiente',
      },
    },
  });

  const { _sum: consumedBudget } = await prisma.transacciones_financieras.aggregate({
    _sum: {
      monto: true,
    },
    where: {
      id_proyecto: {
        in: projects.map(p => p.id_proyecto),
      },
      tipos_transaccion_financiera: {
        naturaleza: 'Gasto',
      },
    },
  });

  const projectsWithTaskProgress = await Promise.all(
    projects.map(async (project) => {
      const totalTasks = await prisma.tareas.count({ where: { id_proyecto: project.id_proyecto } });
      const completedTasks = await prisma.tareas.count({
        where: {
          id_proyecto: project.id_proyecto,
          estados_tarea: { nombre_estado: 'Completada' },
        },
      });
      const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      return {
        id: project.id_proyecto,
        name: project.nombre_proyecto,
        status: project.estados_proyecto?.nombre_estado,
        progress: parseFloat(progress.toFixed(2)),
      };
    })
  );

  return {
    totalManagedProjects: projects.length,
    activeManagedProjects: activeProjectsCount,
    overdueManagedProjects: overdueProjects,
    pendingTasksInManagedProjects: tasksInMyProjects,
    consumedBudget: consumedBudget?.monto?.toNumber() || 0,
    projectsWithTaskProgress,
  };
}

// ======================================
// QUERIES FOR COLLABORATOR DASHBOARD
// ======================================

export async function getCollaboratorTasksOverview(userId: string) {
  const assignedTasks = await prisma.tarea_asignados.findMany({
    where: { id_usuario: userId },
    include: {
      tareas: {
        include: {
          estados_tarea: { select: { nombre_estado: true } },
          prioridades_tarea: { select: { nombre_prioridad: true } },
          proyectos: { select: { nombre_proyecto: true } },
          fases_proyecto: { select: { nombre_fase: true } },
        },
      },
    },
  });

  const totalAssigned = assignedTasks.length;
  const pendingTasks = assignedTasks.filter(ta => ta.tareas.estados_tarea?.nombre_estado === 'Pendiente').length;
  
  const completedToday = assignedTasks.filter(ta =>
    ta.tareas.estados_tarea?.nombre_estado === 'Completada' &&
    ta.tareas.fecha_creacion?.toDateString() === new Date().toDateString()
  ).length;
  
  const overdueTasks = assignedTasks.filter(ta =>
    ta.tareas.fecha_vencimiento && ta.tareas.fecha_vencimiento < new Date() && 
    ta.tareas.estados_tarea?.nombre_estado !== 'Completada'
  ).length;

  return {
    totalAssigned,
    pendingTasks,
    completedToday,
    overdueTasks,
    tasks: assignedTasks.map(ta => ({
      id: ta.tareas.id_tarea,
      name: ta.tareas.nombre_tarea,
      project: ta.tareas.proyectos?.nombre_proyecto,
      phase: ta.tareas.fases_proyecto?.nombre_fase,
      status: ta.tareas.estados_tarea?.nombre_estado,
      dueDate: ta.tareas.fecha_vencimiento,
      priority: ta.tareas.prioridades_tarea?.nombre_prioridad,
    })),
  };
}

// ======================================
// QUERIES FOR CONSULTANT DASHBOARD
// ======================================

export async function getConsultantProjectsOverview(userId: string) {
  const projects = await prisma.proyectos.findMany({
    where: {
      proyecto_equipo: {
        some: {
          id_usuario: userId,
        },
      },
    },
    include: {
      estados_proyecto: { select: { nombre_estado: true } },
    },
  });

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.estados_proyecto?.nombre_estado === 'En Progreso').length;

  const projectsWithTaskProgress = await Promise.all(
    projects.map(async (project) => {
      const totalTasks = await prisma.tareas.count({ where: { id_proyecto: project.id_proyecto } });
      const completedTasks = await prisma.tareas.count({
        where: {
          id_proyecto: project.id_proyecto,
          estados_tarea: { nombre_estado: 'Completada' },
        },
      });
      const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      return {
        id: project.id_proyecto,
        name: project.nombre_proyecto,
        status: project.estados_proyecto?.nombre_estado,
        progress: parseFloat(progress.toFixed(2)),
      };
    })
  );

  return {
    totalProjects,
    activeProjects,
    projectsWithTaskProgress,
  };
}

// ======================================
// QUERIES FOR PROJECT PAGE & UTILITIES
// ======================================

export async function getAllProjects() {
  return prisma.proyectos.findMany({
    select: {
      id_proyecto: true,
      nombre_proyecto: true,
      descripcion: true,
      fecha_fin_plan: true,
      estados_proyecto: {
        select: {
          nombre_estado: true,
        },
      },
      usuarios: {
        select: {
          nombre_completo: true,
        },
      },
    },
    orderBy: {
      fecha_inicio_plan: 'desc',
    },
  });
}

export async function getUserProjects(userId: string) {
  return prisma.proyectos.findMany({
    where: {
      OR: [
        { id_usuario_creador: userId },
        {
          proyecto_equipo: {
            some: {
              id_usuario: userId,
            },
          },
        },
      ],
    },
    select: {
      id_proyecto: true,
      nombre_proyecto: true,
      estados_proyecto: {
        select: {
          nombre_estado: true,
        },
      },
    },
  });
}

export async function getUserRoles(userId: string) {
  return prisma.usuario_roles.findMany({
    where: {
      id_usuario: userId,
    },
    select: {
      roles: {
        select: {
          nombre_rol: true,
        },
      },
    },
  });
}

export async function getProjectDetails(projectId: string) {
  return prisma.proyectos.findUnique({
    where: {
      id_proyecto: projectId,
    },
    include: {
      estados_proyecto: true,
      proyecto_equipo: {
        include: {
          usuarios: {
            select: {
              id_usuario: true,
              nombre_completo: true,
            },
          },
        },
      },
      proyecto_beneficiario: {
        include: {
          beneficiarios: true,
        },
      },
    },
  });
}