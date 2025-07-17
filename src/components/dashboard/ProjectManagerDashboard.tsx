import { getProjectManagerOverview } from '@/lib/queries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export async function ProjectManagerDashboard({ userId }: { userId: string }) {
  const data = await getProjectManagerOverview(userId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Gestor de Proyectos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Proyectos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalManagedProjects}</div>
            <p className="text-sm text-muted-foreground">
              {data.activeManagedProjects} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tareas Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.pendingTasksInManagedProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Presupuesto Consumido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.consumedBudget.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progreso de Proyectos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.projectsWithTaskProgress.map(project => (
            <div key={project.id} className="space-y-1">
              <div className="flex justify-between">
                <span>{project.name}</span>
                <span className="text-muted-foreground">{project.progress}%</span>
              </div>
              <Progress value={project.progress} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}