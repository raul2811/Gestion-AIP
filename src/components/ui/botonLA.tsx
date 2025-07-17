'use client';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';

export function BotonLA() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      // Verifica la sesión con el backend
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        router.replace('/dashboard');
      } else {
        router.push('/login');
      }
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center justify-center h-14 px-10 text-lg font-bold text-primary-foreground bg-primary rounded-full shadow-lg hover:bg-primary/90 transition-transform hover:scale-105 transform-gpu"
    >
      {loading ? 'Verificando...' : 'Acceder a la Plataforma'}
      <ArrowRight className="ml-3 h-6 w-6" />
    </button>
  );
}