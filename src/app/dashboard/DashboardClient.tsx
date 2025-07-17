// ruta: src/app/dashboard/DashboardClient.tsx
"use client";

import React from 'react';

// Este componente solo actúa como un contenedor de layout.
// Recibe el dashboard ya decidido como "hijo" (children).
export default function DashboardClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen p-4 md:p-8">
      {children}
    </div>
  );
}