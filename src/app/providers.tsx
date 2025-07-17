// ruta: src/app/providers.tsx
"use client";

import { NextUIProvider } from "@nextui-org/react";

export function Providers({ children }: { children: React.ReactNode }) {
  // El provider puede recibir un router si usas la navegación de Next.js 12,
  // pero para el App Router de Next.js 13+ no es estrictamente necesario.
  return <NextUIProvider>{children}</NextUIProvider>;
}