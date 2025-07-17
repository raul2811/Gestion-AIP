"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, AlertCircleIcon } from 'lucide-react'; 
import { cn } from "@/lib/utils";

// --- Componentes de Shadcn/ui ---
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose, DialogOverlay } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  // --- Estados ---
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [registerNombreCompleto, setRegisterNombreCompleto] = useState('');
  const [registerCedula, setRegisterCedula] = useState('');
  const [registerCorreo, setRegisterCorreo] = useState('');
  const [registerContrasena, setRegisterContrasena] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [isRegisteredDialogOpen, setIsRegisteredDialogOpen] = useState(false);
  const [pendingRole, setPendingRole] = useState(false);

  const quotes = [
    "Esta plataforma ha transformado nuestra manera de gestionar proyectos.",
    "Cada detalle es visible y cada recurso se optimiza al máximo.",
    "La eficiencia y la claridad en un solo lugar.",
    "Nunca antes habíamos tenido tanto control sobre nuestras operaciones."
  ];
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingDelay, setTypingDelay] = useState(100);

  const router = useRouter();

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const currentQuote = quotes[currentQuoteIndex];
    const handleTyping = () => {
      if (isDeleting) {
        if (displayText.length > 0) {
          setDisplayText(currentQuote.substring(0, displayText.length - 1));
          setTypingDelay(50);
        } else {
          setIsDeleting(false);
          setCurrentQuoteIndex(prev => (prev + 1) % quotes.length);
          setTypingDelay(100);
        }
      } else {
        if (displayText.length < currentQuote.length) {
          setDisplayText(currentQuote.substring(0, displayText.length + 1));
        } else {
          timeout = setTimeout(() => setIsDeleting(true), 2500);
        }
      }
    };
    timeout = setTimeout(handleTyping, typingDelay);
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentQuoteIndex, quotes, typingDelay]);

const handleLoginSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');
  setPendingRole(false);
  if (!correo || !contrasena) {
    setError('Por favor, completa todos los campos para continuar.');
    setIsLoading(false);
    return;
  }
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', correo, contrasena }),
    });
    const data = await res.json(); // <-- Obtén la respuesta JSON
    if (res.status === 403) {
      setPendingRole(true);
      setError(data.message);
      setIsLoading(false);
      return;
    }
    if (!res.ok) {
      throw new Error("Credenciales incorrectas. Por favor, verifica tus datos.");
    }
    // Guarda el nombre en localStorage si existe en la respuesta
    if (data.nombre_completo) {
      localStorage.setItem("userName", data.nombre_completo);
    }
    router.replace('/dashboard');
  } catch (err: any) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    if (!registerNombreCompleto || !registerCedula || !registerCorreo || !registerContrasena) {
      setError('Por favor, completa todos los campos para el registro.');
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          nombre_completo: registerNombreCompleto,
          cedula: registerCedula,
          correo: registerCorreo,
          contrasena: registerContrasena,
        }),
      });
      if (!res.ok) {
        throw new Error("Los datos son incorrectos o el usuario ya existe. Verifica la información.");
      }
      setIsRegisteredDialogOpen(true);
      setActiveTab('login');
      setError('');
      setRegisterNombreCompleto('');
      setRegisterCedula('');
      setRegisterCorreo('');
      setRegisterContrasena('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`/* Estilos de animación (sin cambios) */`}</style>
      
      <div className="min-h-screen w-full bg-white lg:grid lg:grid-cols-2">
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-6">
            <Tabs value={activeTab} onValueChange={(tab) => { setActiveTab(tab); setError(''); setPendingRole(false); }}>
              <div className="text-left mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
                  {activeTab === 'register' ? 'Crear una cuenta' : 'Bienvenido de nuevo'}
                </h2>
                <p className="text-sm text-zinc-500">
                  {activeTab === 'register' ? 'Ingresa tus datos para registrarte.' : 'Ingresa tus credenciales para acceder a tu cuenta.'}
                </p>
              </div>
              
              {error && (
                <Alert variant={pendingRole ? "default" : "destructive"}>
                  <AlertCircleIcon className="h-4 w-4" />
                  <AlertTitle>{pendingRole ? "Cuenta pendiente" : "Error"}</AlertTitle>
                  <AlertDescription>
                    {pendingRole
                      ? (
                        <>
                          ¡Tu cuenta ha sido creada con éxito!
                        </>
                      )
                      : error}
                  </AlertDescription>
                </Alert>
                )}

              <TabsContent value="login">
             {pendingRole ? (
                <div className="py-8 text-center">
                  <h3 className="text-xl font-semibold mb-2 text-zinc-900">Acceso pendiente</h3>
                  <p className="text-zinc-700 mb-4">
                    ¡Tu cuenta ha sido creada con éxito!<br /><br />
                    Como medida de seguridad para proteger la plataforma, un administrador debe verificar y asignar un rol a tu nueva cuenta antes de que puedas acceder.<br /><br />
                    Este proceso suele tomar solo unos minutos. Por favor, intenta iniciar sesión de nuevo en un momento.
                  </p>
                </div>
              ) : (
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="correo" className="text-zinc-900">Correo</Label>
                        <Input 
                          id="correo" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required 
                          autoComplete="username" placeholder="tu@correo.com" 
                          className={cn("text-zinc-900", error && activeTab === 'login' ? "border-red-500 focus-visible:ring-red-500" : "border-zinc-300")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contrasena" className="text-zinc-900">Contraseña</Label>
                        <div className="relative">
                          <Input 
                            id="contrasena" type={showPassword ? "text" : "password"} value={contrasena} onChange={(e) => setContrasena(e.target.value)} required 
                            autoComplete="current-password" placeholder="••••••••" 
                            className={cn("text-zinc-900", error && activeTab === 'login' ? "border-red-500 focus-visible:ring-red-500" : "border-zinc-300")}
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-800" tabIndex={-1}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full bg-zinc-900 text-white hover:bg-zinc-800">
                      {isLoading ? "Ingresando..." : "Iniciar Sesión"}
                    </Button>
                  </form>
                )}
                <p className="mt-4 text-center text-sm text-zinc-600">
                  ¿No tienes una cuenta?{" "}
                  <button onClick={() => { setActiveTab('register'); setError(''); setPendingRole(false); }} className="font-medium text-blue-600 hover:underline">Crear una</button>
                </p>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="grid gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="registerNombreCompleto" className="text-zinc-900">Nombre</Label>
                      <Input 
                        id="registerNombreCompleto" value={registerNombreCompleto} onChange={(e) => setRegisterNombreCompleto(e.target.value)} required 
                        placeholder="John Doe" 
                        className={cn("text-zinc-900", error && activeTab === 'register' ? "border-red-500 focus-visible:ring-red-500" : "border-zinc-300")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registerCedula" className="text-zinc-900">Cédula</Label>
                      <Input 
                        id="registerCedula" value={registerCedula} onChange={(e) => setRegisterCedula(e.target.value)} required 
                        placeholder="Ej: 8-123-456" 
                        className={cn("text-zinc-900", error && activeTab === 'register' ? "border-red-500 focus-visible:ring-red-500" : "border-zinc-300")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registerCorreo" className="text-zinc-900">Correo</Label>
                      <Input 
                        id="registerCorreo" type="email" value={registerCorreo} onChange={(e) => setRegisterCorreo(e.target.value)} required 
                        placeholder="tu@correo.com" 
                        className={cn("text-zinc-900", error && activeTab === 'register' ? "border-red-500 focus-visible:ring-red-500" : "border-zinc-300")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registerContrasena" className="text-zinc-900">Contraseña</Label>
                      <div className="relative">
                        <Input 
                          id="registerContrasena" type={showPassword ? "text" : "password"} value={registerContrasena} onChange={(e) => setRegisterContrasena(e.target.value)} required 
                          placeholder="••••••••" 
                          className={cn("text-zinc-900", error && activeTab === 'register' ? "border-red-500 focus-visible:ring-red-500" : "border-zinc-300")}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-800" tabIndex={-1}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full bg-zinc-900 text-white hover:bg-zinc-800">
                    {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
                  </Button>
                </form>
                <p className="mt-4 text-center text-sm text-zinc-600">
                  ¿Ya tienes una cuenta?{" "}
                  <button onClick={() => { setActiveTab('login'); setError(''); setPendingRole(false); }} className="font-medium text-blue-600 hover:underline">Inicia sesión</button>
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="hidden bg-zinc-900 lg:flex lg:flex-col lg:p-10 text-white">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span>AIP GESTIÓN</span>
          </div>
          <div className="mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg min-h-[60px]">
                &ldquo;{displayText}<span className="inline-block w-0.5 h-5 bg-zinc-400 animate-pulse ml-1"></span>&rdquo;
              </p>
              <footer className="text-sm text-zinc-400">Puntos Importantes</footer>
            </blockquote>
          </div>
        </div>
        
        {/* Diálogo de Éxito */}
        <Dialog open={isRegisteredDialogOpen} onOpenChange={setIsRegisteredDialogOpen}>
          <DialogOverlay />
          <DialogContent>
            <DialogTitle>¡Usuario creado correctamente!</DialogTitle>
            <DialogDescription>
              Ahora puedes iniciar sesión con tu correo y contraseña.
            </DialogDescription>
            <DialogClose asChild>
              <Button onClick={() => setIsRegisteredDialogOpen(false)} className="mt-4 w-full bg-zinc-900 text-white hover:bg-zinc-800">
                Cerrar
              </Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}