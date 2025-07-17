import { getCollaboratorTasksOverview } from '@/lib/queries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export async function CollaboratorDashboard({ userId }: { userId: string }) {
  const { totalAssigned, pendingTasks, completedToday, overdueTasks, tasks } = await getCollaboratorTasksOverview(userId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mis Tareas</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssigned}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completadas Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedToday}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atrasadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueTasks}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Tareas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarea</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead>Fase</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Vencimiento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map(task => (
                <TableRow key={task.id}>
                  <TableCell>{task.name}</TableCell>
                  <TableCell>{task.project}</TableCell>
                  <TableCell>{task.phase}</TableCell>
                  <TableCell>
                    <Badge variant={task.priority === 'Alta' ? 'destructive' : task.priority === 'Media' ? 'warning' : 'default'}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={task.status === 'Completada' ? 'success' : 'default'}>
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {task.dueDate?.toLocaleDateString() || 'Sin fecha'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}