import { getConsultantProjectsOverview } from '@/lib/queries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export async function ConsultantDashboard({ userId }: { userId: string }) {
  const { totalProjects, activeProjects, projectsWithTaskProgress } = await getConsultantProjectsOverview(userId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Proyectos Asignados</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Proyectos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Proyectos Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progreso de Proyectos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {projectsWithTaskProgress.map(project => (
            <div key={project.id} className="space-y-1">
              <div className="flex justify-between">
                <span>{project.name}</span>
                <span className="text-muted-foreground">{project.progress}%</span>
              </div>
              <Progress value={project.progress} />
              <div className="text-sm text-muted-foreground">
                Estado: {project.status}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}