import Link from 'next/link';
import { ArrowRight, Database, Box, CheckCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AppNavbar } from "@/components/layout/Navbar"; 
import { BotonLA } from '@/components/ui/botonLA'; // Importa tu botón

export default function HomePage() {

  const features = [
    {
      icon: <Database className="w-10 h-10 text-primary" />,
      title: "Gestión de Datos (CRUD)",
      description: "El núcleo del sistema permite operaciones de Crear, Leer, Actualizar y Borrar datos de forma eficiente, segura y escalable."
    },
    {
      icon: <Box className="w-10 h-10 text-primary" />,
      title: "Desarrollo en Contenedores",
      description: "Utilizamos Podman para encapsular la aplicación, garantizando un entorno de desarrollo consistente y un despliegue predecible."
    },
    {
      icon: <ArrowRight className="w-10 h-10 text-primary" />,
      title: "Potenciado por Next.js",
      description: "Construido sobre el framework líder de React, aprovechando Server Components para un rendimiento óptimo y una experiencia de desarrollo moderna."
    }
  ];

  const testimonials = [
    {
      quote: "No es una librería de componentes. Es una colección de componentes reutilizables que puedes copiar y pegar. Eres el dueño del código.",
      name: "Filosofía de Shadcn/UI",
      role: "Control total sobre el diseño y la funcionalidad."
    },
    {
      quote: "Next.js te permite construir aplicaciones web de alta calidad con el poder de los componentes de React y la mejor experiencia de desarrollo.",
      name: "Equipo de Vercel",
      role: "Impulsando el rendimiento y la escalabilidad."
    }
  ];

  const roleDescriptions = [
    {
      name: "Colaborador",
      description: "El rol base para miembros del equipo.",
      features: ["Visualizar proyectos y tareas", "Actualizar estado de tareas", "Añadir comentarios y archivos"],
      isMain: false,
    },
    {
      name: "Administrador",
      description: "Control total a nivel de organización.",
      features: ["Gestionar todos los proyectos", "Administrar usuarios y roles", "Ver reportes globales"],
      isMain: true,
    },
    {
      name: "Maestro",
      description: "El superusuario con acceso total al sistema.",
      features: ["Control absoluto de la plataforma", "Acceso a configuraciones críticas", "Rol de máximo privilegio"],
      isMain: false,
    },
  ];

  const faqs = [
    {
      question: "¿Para qué tipo de proyectos está diseñada la plataforma?",
      answer: "AIP Gestión está diseñada para administrar proyectos de I+D+i (Investigación, Desarrollo e innovación), como los proyectos tipo AIP (Aprendizaje e Investigación) comunes en el ecosistema científico y tecnológico de Panamá."
    },
    {
      question: "¿Cómo se garantiza la seguridad de los datos?",
      answer: "La seguridad es fundamental. Implementamos RLS (Row-Level Security) para que los usuarios solo vean los datos que les corresponden, y RBAC (Role-Based Access Control) para definir permisos estrictos según el rol de cada usuario."
    },
    {
      question: "¿Cuál es la tecnología principal detrás de esta plataforma?",
      answer: "El stack principal incluye Next.js para el frontend y backend, TypeScript para la seguridad de tipos, Tailwind CSS y Shadcn/UI para la interfaz, y PostgreSQL con Supabase para la base de datos y autenticación."
    }
  ];

  return (
    <main className="flex-grow bg-background text-foreground">
      <AppNavbar />
      {/* --- Sección Hero (Principal) --- */}
      <section className="relative flex items-center py-20 md:py-32">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left animate-fade-in-up">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase animate-gradient bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] bg-clip-text text-transparent">
                GESTION AIP
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                Plataforma en desarrollo para la gestión de proyectos de I+D+i, construida con herramientas modernas para impulsar la productividad y el control.
              </p>
              <div className="mt-10 flex justify-center lg:justify-start">
                <BotonLA />
              </div>
            </div>
            
            {/* --- PANEL VISUAL RESTAURADO --- */}
            <div className="hidden lg:flex justify-center animate-fade-in">
              <div className="relative w-full max-w-md h-96 rounded-2xl bg-slate-900/70 border border-primary/20 shadow-2xl shadow-primary/10 overflow-hidden backdrop-blur-sm">
                 <div className="absolute top-0 left-0 w-full px-4 py-2 flex items-center gap-2 border-b border-slate-700">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                 </div>
                 <div className="p-6 pt-12 font-mono text-sm text-slate-400 space-y-4">
                    <div className="flex gap-2">
                      <div className="w-1/2 h-16 bg-slate-800/50 rounded-lg p-2 animate-pulse">
                         <div className="w-1/2 h-2 bg-slate-700 rounded"></div>
                         <div className="w-1/3 h-4 bg-slate-600 rounded mt-2"></div>
                      </div>
                      <div className="w-1/2 h-16 bg-slate-800/50 rounded-lg p-2 animate-pulse" style={{animationDelay: '0.1s'}}>
                         <div className="w-1/2 h-2 bg-slate-700 rounded"></div>
                         <div className="w-1/3 h-4 bg-slate-600 rounded mt-2"></div>
                      </div>
                    </div>
                    <div className="w-full h-32 bg-slate-800/50 rounded-lg p-2 flex items-end gap-2 animate-pulse" style={{animationDelay: '0.2s'}}>
                       <div className="w-1/4 h-1/2 bg-primary/60 rounded-t-sm"></div>
                       <div className="w-1/4 h-3/4 bg-primary/60 rounded-t-sm"></div>
                       <div className="w-1/4 h-1/3 bg-primary/60 rounded-t-sm"></div>
                       <div className="w-1/4 h-full bg-primary/60 rounded-t-sm"></div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Resto de las secciones (sin cambios) --- */}
      <section className="py-20 bg-muted/40">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight">Pilares Tecnológicos</h2>
            <p className="mt-4 text-lg text-muted-foreground">Las herramientas y conceptos que hacen posible este proyecto.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-8 bg-background rounded-2xl shadow-lg border border-border/20 text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight">Nuestra Filosofía de Desarrollo</h2>
            <p className="mt-4 text-lg text-muted-foreground">Por qué elegimos estas tecnologías.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-8 bg-muted/40 rounded-2xl border border-border/20 flex flex-col">
                <p className="text-foreground flex-grow text-lg italic">"{testimonial.quote}"</p>
                <div className="mt-6 pt-6 border-t border-border/20">
                  <p className="font-bold">{testimonial.name}</p>
                  <p className="text-sm text-primary">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/40">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight">Roles en la Plataforma</h2>
            <p className="mt-4 text-lg text-muted-foreground">Cada usuario tiene un propósito. Así se estructuran los principales.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {roleDescriptions.map((role) => (
              <div key={role.name} className={`p-8 rounded-2xl border flex flex-col ${role.isMain ? 'border-primary shadow-primary/20 shadow-2xl' : 'border-border/20 bg-background'}`}>
                {role.isMain && <div className="text-center mb-4"><span className="text-xs font-bold uppercase text-primary bg-primary/10 px-3 py-1 rounded-full">Rol Principal</span></div>}
                <h3 className="text-2xl font-bold text-center">{role.name}</h3>
                <p className="text-muted-foreground text-center h-12 my-6">{role.description}</p>
                <ul className="space-y-4 my-8 flex-grow">
                  {role.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full h-12 px-8 text-base font-bold rounded-full transition-colors mt-auto ${role.isMain ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}>
                  Ver Permisos
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight">Preguntas del Proyecto</h2>
            <p className="mt-4 text-lg text-muted-foreground">Respuestas a dudas clave sobre AIP Gestión.</p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
               <AccordionItem key={index} value={`item-${index+1}`}>
                <AccordionTrigger className="text-lg text-left font-semibold">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="bg-muted/40 rounded-2xl p-12 text-center">
            <h2 className="text-4xl font-bold tracking-tight">Explora la Plataforma</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Crea una cuenta para probar las funcionalidades del sistema en su estado actual de desarrollo.
            </p>
            <div className="mt-8">
              <a href="/login?tab=register">
                  <span className="inline-flex items-center justify-center h-14 px-10 text-lg font-bold text-primary-foreground bg-primary rounded-full shadow-lg hover:bg-primary/90 transition-transform hover:scale-105 transform-gpu">
                    Crear una Cuenta
                  </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-border/20">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} AIP Gestión. Un proyecto en desarrollo.</p>
        </div>
      </footer>
    </main>
  );
}