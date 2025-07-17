// ruta: src/components/proyectos/CreateProjectForm.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

type User = { id_usuario: string; nombre_completo: string | null };
type Status = { id_estado_proyecto: string; nombre_estado: string | null };

interface CreateProjectFormProps {
  users: User[];
  statuses: Status[];
  onFormSubmit: () => void;
}

export function CreateProjectForm({ users, statuses, onFormSubmit }: CreateProjectFormProps) {
  const [formData, setFormData] = useState({
    nombre_proyecto: '',
    descripcion: '',
    id_usuario_creador: '',
    id_estado_proyecto: '',
    fecha_inicio_plan: undefined as Date | undefined,
    fecha_fin_plan: undefined as Date | undefined,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/proyectos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Error al crear el proyecto');
      }

      onFormSubmit();
      router.refresh();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const inputClasses = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  const buttonClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <input
        type="text"
        placeholder="Nombre del Proyecto"
        className={inputClasses}
        value={formData.nombre_proyecto}
        onChange={(e) => setFormData({ ...formData, nombre_proyecto: e.target.value })}
        required
      />
      <textarea
        placeholder="Descripción del proyecto..."
        className={`${inputClasses} min-h-[80px]`}
        value={formData.descripcion}
        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-4">
        <Select onValueChange={(value) => setFormData({ ...formData, id_usuario_creador: value })} required>
          <SelectTrigger><SelectValue placeholder="Seleccionar Gestor" /></SelectTrigger>
          <SelectContent>
            {users.map(user => (
              <SelectItem key={user.id_usuario} value={user.id_usuario}>{user.nombre_completo}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => setFormData({ ...formData, id_estado_proyecto: value })} required>
          <SelectTrigger><SelectValue placeholder="Seleccionar Estado" /></SelectTrigger>
          <SelectContent>
            {statuses.map(status => (
              <SelectItem key={status.id_estado_proyecto} value={status.id_estado_proyecto}>{status.nombre_estado}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" className={cn(`${buttonClasses} border border-input bg-transparent hover:bg-accent hover:text-accent-foreground w-full justify-start text-left font-normal h-10 px-3 py-2`)}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.fecha_inicio_plan ? format(formData.fecha_inicio_plan, "PPP",) : <span>Fecha de Inicio</span>}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.fecha_inicio_plan} onSelect={(date) => setFormData({...formData, fecha_inicio_plan: date})} initialFocus /></PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
             <button type="button" className={cn(`${buttonClasses} border border-input bg-transparent hover:bg-accent hover:text-accent-foreground w-full justify-start text-left font-normal h-10 px-3 py-2`)}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.fecha_fin_plan ? format(formData.fecha_fin_plan, "PPP") : <span>Fecha de Fin</span>}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.fecha_fin_plan} onSelect={(date) => setFormData({...formData, fecha_fin_plan: date})} /></PopoverContent>
        </Popover>
      </div>
      
      {error && <p className="text-sm text-red-500">{error}</p>}
      
      <button type="submit" disabled={isLoading} className={`${buttonClasses} bg-primary text-primary-foreground hover:bg-primary/90 w-full h-10 px-4 py-2`}>
        {isLoading ? 'Guardando...' : 'Guardar Proyecto'}
      </button>
    </form>
  );
}