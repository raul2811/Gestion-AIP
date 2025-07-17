import React, { Suspense } from 'react';
import { AppNavbar } from '@/components/layout/Navbar';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  // Si no es administrador, maestro o colaborador, muestra el mensaje
  const validRoles = ['Administrador', 'Maestro', 'Colaborador'];
  if (!validRoles.includes(session.user.rol)) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <AppNavbar />
        <div className="flex flex-col items-center justify-center flex-grow">
          <h1 className="text-4xl font-bold mb-4">🚧 Sección en construcción 🚧</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Esta sección estará disponible próximamente para tu rol.<br />
            Si necesitas acceso, contacta al administrador.
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppNavbar />
      <div className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
      <Suspense fallback={<DashboardSkeleton />}>
        <AdminDashboard userRole={session.user.rol} userId={session.user.userId} />
      </Suspense>
      </div>
    </div>
  );
}