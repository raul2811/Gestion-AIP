'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@nextui-org/react';

export function BotonCerrarSesion() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    router.replace('/login');
  };

  return (
    <Button
      color="danger"
      variant="flat"
      size="md"
      onClick={handleLogout}
      className="cursor-pointer"
    >
      Cerrar sesión
    </Button>
  );
}