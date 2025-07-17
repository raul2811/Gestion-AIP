import React from 'react';

import {
  getGeneralOverviewData,
  getProjectStatusDistribution,
  getMonthlyFinancialTrend,
  getUsersByRole,
  getTasksByPriorityAndStatus,
  getAllUsers,
  getAllProjects,
  getProjectCreationTrend,
  getMonthlyUserRegistrations,
  getCollaboratorTasksOverview // <-- importa tu query
} from '@/lib/queries';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { AdminDashboardUI } from './AdminDashboardUI';

// Ajusta tus tipos según el modelo que uses en el frontend
type UserData = {
  id: string;
  name: string;
  email: string;
  cedula: string;
  status: 'Activo' | 'Inactivo';
  role: string;
};

type ProjectData = {
  id: string;
  name: string;
  description: string;
  status: string;
  manager: string;
  dueDate: string; // <-- Cambiado a string para que coincida con el UI
};

// --- Recibe el userRole y userId como parámetro ---
export async function AdminDashboard({ userRole, userId }: { userRole: string, userId: string }) {
  try {
    const currentYear = new Date().getFullYear();

    const [
      overview,
      projectStatus,
      financialData,
      usersByRole,
      tasksByPriority,
      allUsersRaw,
      allProjectsRaw,
      projectCreationTrend,
      userRegistrationTrend
    ] = await Promise.all([
      getGeneralOverviewData(),
      getProjectStatusDistribution(),
      getMonthlyFinancialTrend(currentYear),
      getUsersByRole(),
      getTasksByPriorityAndStatus(),
      getAllUsers(),
      getAllProjects(),
      getProjectCreationTrend(currentYear),
      getMonthlyUserRegistrations(currentYear)
    ]);

    // Mapeo y validación de los usuarios
    const allUsers: UserData[] = allUsersRaw.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      cedula: user.cedula,
      status: (user.status === 'Activo' ? 'Activo' : 'Inactivo') as 'Activo' | 'Inactivo',
      role: user.role,
    }));

    // Mapeo y validación de los proyectos
    const allProjects: ProjectData[] = allProjectsRaw.map((project: any) => ({
      id: project.id_proyecto,
      name: project.nombre_proyecto,
      description: project.descripcion,
      status: project.estados_proyecto?.nombre_estado || 'Sin estado',
      manager: project.usuarios?.nombre_completo || 'Sin responsable',
      dueDate: project.fecha_fin_plan ? new Date(project.fecha_fin_plan).toISOString() : '', // <-- string
    }));

    // --- Obtén el overview del colaborador si aplica ---
    let collaboratorOverview = undefined;
    if (userRole === "Colaborador" && userId) {
      collaboratorOverview = await getCollaboratorTasksOverview(userId);
    }

    return (
      <AdminDashboardUI
        userRole={userRole}
        overview={overview}
        projectStatus={projectStatus}
        financialData={financialData}
        usersByRole={usersByRole}
        allUsers={allUsers}
        allProjects={allProjects}
        projectCreationTrend={projectCreationTrend}
        userRegistrationTrend={userRegistrationTrend}
        collaboratorOverview={collaboratorOverview} // <-- aquí lo pasas
      />
    );
  } catch (error) {
    console.error("Error crítico al cargar los datos del dashboard:", error);

    return (
      <Alert variant="destructive" className="mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          No se pudieron cargar los datos del dashboard.
        </AlertDescription>
      </Alert>
    );
  }
}