"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { BarChart, PieChart, Pie, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line } from 'recharts';
import { Users, Briefcase, DollarSign, Wrench, BarChart2, PlusCircle, Pencil, Trash2, AlertCircleIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// --- Interfaces ---
interface OverviewData {
  totalProjects: number;
  activeProjects: number;
  totalUsers: number;
  balanceNetMonth: number;
  totalIncomeMonth: number;
  totalAssets: number;
  pendingMaintenances: number;
}
interface ChartData {
  name: string;
  value: number;
}
interface UserRegistrationData {
    month: string;
    total: number;
}
interface ProjectCreationData {
    month: string;
    total: number;
}
interface ProjectData {
  id: string;
  name: string;
  status: string;
  manager: string;
  dueDate: string;
}
interface UserData {
    id: string;
    name: string;
    email: string;
    role: string;
    cedula: string;
    status: 'Activo' | 'Inactivo';
}

const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
        <BarChart2 className="h-12 w-12 mb-4 opacity-50" />
        <h3 className="text-lg font-semibold">No hay datos disponibles</h3>
        <p className="text-sm">{message}</p>
    </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
          <div className="p-3 text-sm bg-background/95 border rounded-lg shadow-xl backdrop-blur-sm">
            <p className="font-bold mb-2">{label}</p>
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center">
                <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color || entry.fill }}></div>
                <span className="capitalize mr-2">{entry.name}:</span>
                <span className="font-mono font-bold">
                  {entry.name.toLowerCase().includes('gasto') || entry.name.toLowerCase().includes('ingreso') ? '$' : ''}
                  {entry.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        );
      }
      return null;
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function AdminDashboardUI({
  userRole, 
  overview,
  projectStatus,
  financialData,
  usersByRole,
  allProjects = [],
  allUsers = [],
  projectCreationTrend = [],
  userRegistrationTrend = [],
  collaboratorOverview, // <-- agrega aquí
}: {
  userRole: string; 
  overview: OverviewData;
  projectStatus: ChartData[];
  financialData: any[];
  usersByRole: ChartData[];
  allProjects?: ProjectData[];
  allUsers?: UserData[];
  projectCreationTrend?: ProjectCreationData[];
  userRegistrationTrend?: UserRegistrationData[];
  collaboratorOverview?: {
    pendingTasks: number;
    completedToday: number;
    overdueTasks: number;
    totalAssigned: number;
    tasks: any[];
  };
}) {

  // --- Estados para los modales ---
  const [isCreateUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  
  const [newUser, setNewUser] = useState({ name: '', cedula: '', email: '', contrasena: '', role: '', status: 'Activo' });
  const [editingUser, setEditingUser] = useState<UserData | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // --- Estado local para usuarios (sin recargar la página) ---
  const [users, setUsers] = useState<UserData[]>(Array.isArray(allUsers) ? allUsers : []);

  // --- Handlers para CRUD ---
  const handleOpenEditDialog = (user: UserData) => {
    setFormError('');
    setEditingUser(user);
    setEditUserDialogOpen(true);
  };
  
  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');
    const payload = {
        nombre_completo: newUser.name, cedula: newUser.cedula, correo: newUser.email,
        contrasena: newUser.contrasena, rol: newUser.role, estado: newUser.status
    };
    try {
        const response = await fetch('/api/dashboard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al crear.');
        setCreateUserDialogOpen(false);
        setNewUser({ name: '', cedula: '', email: '', contrasena: '', role: '', status: 'Activo' });
        setUsers(prev => [
          ...prev,
          {
            id: data.userId,
            name: newUser.name,
            email: newUser.email,
            cedula: newUser.cedula,
            role: newUser.role,
            status: newUser.status as 'Activo' | 'Inactivo',
          }
        ]);
    } catch (error: any) {
        setFormError(error.message);
    } finally {
        setIsSubmitting(false);
    }
  }

  async function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);
    setFormError('');
    const payload = {
      id_usuario: editingUser.id, nombre_completo: editingUser.name, cedula: editingUser.cedula,
      correo: editingUser.email, rol: editingUser.role, estado: editingUser.status
    };
    try {
      const response = await fetch('/api/dashboard', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al actualizar.');
      setEditUserDialogOpen(false);
      setEditingUser(null);
      setUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u));
    } catch (error: any) {
      setFormError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteUser() {
    if (!userToDelete) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/dashboard?userId=${userToDelete.id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al eliminar.');
      setUserToDelete(null);
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
    } catch (error: any) {
      console.error(error.message);
      setUserToDelete(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  // --- Mapeo defensivo para usuarios ---
  const mappedUsers = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    cedula: u.cedula,
    status: u.status,
    role: u.role,
  }));

if (userRole === "Colaborador") {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [password, setPassword] = useState('');
  const [isChanging, setIsChanging] = useState(false);
  const [changeError, setChangeError] = useState('');
  const [changeSuccess, setChangeSuccess] = useState('');

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setIsChanging(true);
    setChangeError('');
    setChangeSuccess('');
    try {
      const res = await fetch('/api/dashboard', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cambiar la contraseña');
      setChangeSuccess('Contraseña actualizada correctamente.');
      setPassword('');
      setShowPasswordForm(false);
    } catch (err: any) {
      setChangeError(err.message);
    } finally {
      setIsChanging(false);
    }
  }


  // --- Vista para colaborador---
  return (
    <div className="w-full bg-background">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Encabezado con botón alineado a la derecha */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Bienvenido, colaborador</h1>
            <p className="text-muted-foreground">
              Aquí puedes ver tus tareas asignadas y el estado de tus proyectos.
            </p>
          </div>
          <Button variant="outline" onClick={() => setShowPasswordForm(v => !v)}>
            Cambiar mi contraseña
          </Button>
        </div>
        {showPasswordForm && (
          <Card>
            <CardHeader>
              <CardTitle>Cambiar mi contraseña</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleChangePassword}>
                <Input
                  type="password"
                  placeholder="Nueva contraseña"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <Button type="submit" disabled={isChanging}>
                  {isChanging ? 'Cambiando...' : 'Cambiar contraseña'}
                </Button>
                {changeError && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{changeError}</AlertDescription>
                  </Alert>
                )}
                {changeSuccess && (
                  <Alert variant="default" className="mt-2">
                    <AlertTitle>Éxito</AlertTitle>
                    <AlertDescription>{changeSuccess}</AlertDescription>
                  </Alert>
                )}
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Resumen de tus tareas</CardTitle>
            <CardDescription>Estado actual de tus tareas asignadas</CardDescription>
          </CardHeader>
          <CardContent className="h-[220px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Pendientes', value: collaboratorOverview?.pendingTasks ?? 0 },
                    { name: 'Completadas hoy', value: collaboratorOverview?.completedToday ?? 0 },
                    { name: 'Atrasadas', value: collaboratorOverview?.overdueTasks ?? 0 },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  label
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>



        {/* Se renderizan las tareas del Colaborador */}
        <Card>
          <CardHeader>
            <CardTitle>Tus tareas asignadas</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState message="No tienes tareas asignadas." />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Proyectos donde participas</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState message="No participas en ningún proyecto actualmente." />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


  // --- Vista para administrador ---
  return (
    <div className="w-full bg-background">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* Header de la página */}
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard de Administrador</h1>
                <p className="text-muted-foreground">Centro de control para la gestión de la plataforma.</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Creación Rápida
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Crear Nuevo</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { setCreateUserDialogOpen(true); setFormError(''); }}>Usuario</DropdownMenuItem>
                <DropdownMenuItem>Proyecto</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
        
        {/* Modal para crear usuario */}
        <Dialog open={isCreateUserDialogOpen} onOpenChange={setCreateUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              <DialogDescription>Completa los datos para registrar un nuevo usuario.</DialogDescription>
            </DialogHeader>
            <form className="space-y-4 pt-4" onSubmit={handleCreateUser}>
              {formError && (<Alert variant="destructive"><AlertCircleIcon className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{formError}</AlertDescription></Alert>)}
              <Input type="text" placeholder="Nombre Completo" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} required />
              <Input type="text" placeholder="Cédula" value={newUser.cedula} onChange={e => setNewUser({ ...newUser, cedula: e.target.value })} required />
              <Input type="email" placeholder="Correo Electrónico" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required />
              <Input type="password" placeholder="Contraseña Temporal" value={newUser.contrasena} onChange={e => setNewUser({ ...newUser, contrasena: e.target.value })} required />
              <Select value={newUser.role} onValueChange={role => setNewUser({ ...newUser, role })} required>
                <SelectTrigger><SelectValue placeholder="Selecciona un rol" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="Consultor">Consultor</SelectItem>
                  <SelectItem value="Gestor de proyectos">Gestor de proyectos</SelectItem>
                  <SelectItem value="Colaborador">Colaborador</SelectItem>
                  <SelectItem value="Maestro">Maestro</SelectItem>
                </SelectContent>
              </Select>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setCreateUserDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creando..." : "Crear Usuario"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Modal para editar usuario */}
        <Dialog open={isEditUserDialogOpen} onOpenChange={setEditUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Usuario</DialogTitle>
              <DialogDescription>Modifica los datos del usuario. La contraseña no se puede cambiar aquí.</DialogDescription>
            </DialogHeader>
            {editingUser && (
              <form className="space-y-4 pt-4" onSubmit={handleUpdateUser}>
                {formError && (<Alert variant="destructive"><AlertCircleIcon className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{formError}</AlertDescription></Alert>)}
                <Input type="text" placeholder="Nombre Completo" value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} required />
                <Input type="text" placeholder="Cédula" value={editingUser.cedula} onChange={e => setEditingUser({ ...editingUser, cedula: e.target.value })} required />
                <Input type="email" placeholder="Correo Electrónico" value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} required />
                <Select value={editingUser.role} onValueChange={role => setEditingUser({ ...editingUser, role })}>
                  <SelectTrigger><SelectValue placeholder="Selecciona un rol" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrador">Administrador</SelectItem>
                    <SelectItem value="Consultor">Consultor</SelectItem>
                    <SelectItem value="Gestor de proyectos">Gestor de proyectos</SelectItem>
                    <SelectItem value="Colaborador">Colaborador</SelectItem>
                    <SelectItem value="Maestro">Maestro</SelectItem>
                  </SelectContent>
                </Select>
                 <Select value={editingUser.status} onValueChange={status => setEditingUser({ ...editingUser, status: status as 'Activo' | 'Inactivo' })}>
                  <SelectTrigger><SelectValue placeholder="Selecciona un estado" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setEditUserDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Guardando..." : "Guardar Cambios"}</Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Diálogo de confirmación para eliminar */}
        <AlertDialog open={userToDelete !== null} onOpenChange={() => setUserToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción es permanente. Se eliminará la cuenta del usuario <span className="font-bold">{userToDelete?.name}</span> y todos sus datos asociados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteUser} disabled={isSubmitting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {isSubmitting ? "Eliminando..." : "Sí, eliminar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Tabs defaultValue="overview" className="w-full">
            <TabsList>
                <TabsTrigger value="overview">Información General</TabsTrigger>
                <TabsTrigger value="analytics">Información Analitica</TabsTrigger>
                <TabsTrigger value="management">Gestión</TabsTrigger>
                <TabsTrigger value="reports" disabled>Reportes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {[ { title: "Proyectos Totales", value: overview.totalProjects, description: `${overview.activeProjects} activos`, icon: Briefcase }, { title: "Usuarios Activos", value: overview.totalUsers, description: "Usuarios registrados", icon: Users }, { title: "Balance del Mes", value: `$${overview.balanceNetMonth?.toLocaleString() ?? 0}`, description: `Ingresos: $${overview.totalIncomeMonth?.toLocaleString() ?? 0}`, icon: DollarSign }, { title: "Activos Totales", value: overview.totalAssets, description: `${overview.pendingMaintenances} mantenimientos`, icon: Wrench }, ].map(({ title, value, description, icon: Icon }, index) => ( <Card key={index}><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{title}</CardTitle><Icon className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{value}</div><p className="text-xs text-muted-foreground">{description}</p></CardContent></Card> ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader><CardTitle>Tendencia Financiera</CardTitle><CardDescription>Ingresos vs Gastos del año en curso.</CardDescription></CardHeader>
                  <CardContent className="h-[350px] p-2"><ResponsiveContainer width="100%" height="100%"><AreaChart data={financialData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}><defs><linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient><linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} /><YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(value) => `$${Number(value / 1000).toFixed(0)}k`} /><Tooltip content={CustomTooltip} /><Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="#10b981" fillOpacity={1} fill="url(#colorIngresos)" /><Area type="monotone" dataKey="gastos" name="Gastos" stroke="#ef4444" fillOpacity={1} fill="url(#colorGastos)" /></AreaChart></ResponsiveContainer></CardContent>
                </Card>
                <Card className="lg:col-span-1">
                    <CardHeader><CardTitle>Proyectos Creados por Mes</CardTitle><CardDescription>Actividad de creación en el último año.</CardDescription></CardHeader>
                    <CardContent className="h-[350px] p-2"><ResponsiveContainer width="100%" height="100%"><LineChart data={projectCreationTrend} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} /><YAxis fontSize={12} tickLine={false} axisLine={false} /><Tooltip content={CustomTooltip} /><Line type="monotone" dataKey="total" name="Proyectos" strokeWidth={2} stroke="#8b5cf6" activeDot={{ r: 8 }} /></LineChart></ResponsiveContainer></CardContent>
                </Card>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="col-span-1">
                  <CardHeader><CardTitle>Estado de Proyectos</CardTitle><CardDescription>Distribución de todos los proyectos.</CardDescription></CardHeader>
                  <CardContent className="h-[300px] p-0"><ResponsiveContainer width="100%" height="100%"><PieChart><Tooltip content={CustomTooltip} /><Pie data={projectStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} cornerRadius={5}>{projectStatus.map((entry: any, index: number) => ( <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> ))}</Pie></PieChart></ResponsiveContainer></CardContent>
                </Card>
                <Card className="col-span-1">
                    <CardHeader><CardTitle>Usuarios por Rol</CardTitle><CardDescription>Cantidad de usuarios en cada rol.</CardDescription></CardHeader>
                    <CardContent className="h-[300px] p-0"><ResponsiveContainer width="100%" height="100%"><BarChart data={usersByRole} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" hide /><YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={80} fontSize={12} /><Tooltip content={CustomTooltip} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} /><Bar dataKey="value" name="Usuarios" radius={[0, 4, 4, 0]}>{usersByRole.map((entry: any, index: number) => ( <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> ))}</Bar></BarChart></ResponsiveContainer></CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-6 mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="lg:col-span-2">
                      <CardHeader><CardTitle>Crecimiento de Usuarios</CardTitle><CardDescription>Nuevos usuarios registrados cada mes.</CardDescription></CardHeader>
                      <CardContent className="h-[350px] p-2">
                          {userRegistrationTrend.length > 0 ? (<ResponsiveContainer width="100%" height="100%"><BarChart data={userRegistrationTrend} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} /><YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} /><Tooltip content={CustomTooltip} /><Bar dataKey="total" name="Nuevos Usuarios" radius={[4, 4, 0, 0]} fill="#3b82f6" /></BarChart></ResponsiveContainer>) : (<EmptyState message="No hay datos de registro de usuarios."/>)}
                      </CardContent>
                  </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="management" className="space-y-8 mt-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div><CardTitle>Gestión de Proyectos</CardTitle><CardDescription>Visualiza, edita o elimina cualquier proyecto.</CardDescription></div>
                        <Button size="sm"><PlusCircle className="mr-2 h-4 w-4"/>Nuevo Proyecto</Button>
                    </CardHeader>
                    <CardContent>
                      <Table><TableHeader><TableRow><TableHead>Nombre del Proyecto</TableHead><TableHead>Estado</TableHead><TableHead>Gestor</TableHead><TableHead>Fecha Límite</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader><TableBody>{allProjects.length > 0 ? allProjects.map((p: ProjectData) => (<TableRow key={p.id}><TableCell className="font-medium">{p.name}</TableCell><TableCell><Badge variant="outline">{p.status}</Badge></TableCell><TableCell>{p.manager}</TableCell><TableCell>{new Date(p.dueDate).toLocaleDateString('es-PA')}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>)) : (<TableRow><TableCell colSpan={5} className="text-center h-24">No hay proyectos para mostrar.</TableCell></TableRow>)}</TableBody></Table>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div><CardTitle>Gestión de Usuarios</CardTitle><CardDescription>Añade, edita o elimina usuarios de la plataforma.</CardDescription></div>
                        <Button size="sm" onClick={() => { setCreateUserDialogOpen(true); setFormError(''); }}><PlusCircle className="mr-2 h-4 w-4"/>Nuevo Usuario</Button>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead>Cédula</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mappedUsers.length > 0 ? mappedUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.name}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{user.role}</TableCell>
                              <TableCell>{user.cedula}</TableCell>
                              <TableCell>
                                <Badge variant={user.status === 'Activo' ? 'default' : 'destructive'}>
                                  {user.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(user)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setUserToDelete(user)} className="text-red-500 hover:text-red-600">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          )) : (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center h-24">No hay usuarios para mostrar.</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}