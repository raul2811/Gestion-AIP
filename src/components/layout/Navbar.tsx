"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from 'next/navigation';
import {
  Navbar,
  NavbarBrand,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Link,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { LayoutDashboard } from "lucide-react";
import { BotonCerrarSesion } from '@/components/ui/botonCS'; 

export function AppNavbar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const pathname = usePathname();
  const [userName, setUserName] = useState("Usuario");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleStorage = () => {
      const name = localStorage.getItem("userName") || "Usuario";
      setUserName(name);
    };
    window.addEventListener("storage", handleStorage);
    handleStorage();
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const menuItems = [
    { label: "Inicio", href: "/" }
  ];

  return (
    <Navbar 
      onMenuOpenChange={setIsMenuOpen} 
      maxWidth="full" 
      position="sticky"
      className="bg-background/80 backdrop-blur-sm border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm"
    >
      <div className="container mx-auto px-6 flex items-center justify-between h-20">
        <div className="flex items-center gap-4">
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            className="sm:hidden"
          />
          <NavbarBrand>
            <Link href="/" className="flex items-center gap-2 text-lg font-bold">
                <LayoutDashboard className="h-7 w-7 text-primary" />
                <p className="font-bold text-inherit">GestionAip</p>
            </Link>
          </NavbarBrand>
        </div>

        <div className="hidden sm:flex gap-8">
          {menuItems.map((item) => (
            <NavbarItem key={item.href} isActive={pathname === item.href}>
              <Link 
                color={pathname === item.href ? "primary" : "foreground"} 
                href={item.href}
                className="transition-colors duration-300 cursor-pointer"
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            </NavbarItem>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          <Dropdown>
            <DropdownTrigger>
              <Avatar 
                isBordered 
                color="primary"
                size="md"
                name={mounted ? userName?.charAt(0).toUpperCase() : undefined}
                className="transition-transform hover:scale-110 cursor-pointer"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Opciones de usuario" className="min-w-[180px]">
              <DropdownItem key="logout" color="danger" className="text-danger">
                <BotonCerrarSesion />
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      <NavbarMenu>
        {menuItems.map((item) => (
          <NavbarMenuItem key={item.href} isActive={pathname === item.href}>
            <Link
              color={pathname === item.href ? "primary" : "foreground"}
              className="w-full cursor-pointer"
              href={item.href}
              size="lg"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}