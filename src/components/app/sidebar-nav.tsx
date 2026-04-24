'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, FileText, Package, UploadCloud, Settings, Users, type LucideIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/context/app-context';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  role?: 'compras' | 'solicitante';
}

export function SidebarNav() {
  const pathname = usePathname();
  const { currentUser } = useAppContext();

  const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/solicitudes', label: 'Requisiciones', icon: FileText },
    { href: '/dashboard/ordenes', label: 'Órdenes de Compra', icon: Package, role: 'compras' },
    { href: '/dashboard/importar', label: 'Importar', icon: UploadCloud, role: 'compras' },
    { href: '/dashboard/administracion/proveedores', label: 'Proveedores', icon: Users, role: 'compras' },
    { href: '/dashboard/administracion', label: 'Administración', icon: Settings, role: 'compras' },
    { href: '/dashboard/v04', label: 'Historial V04', icon: FileText, role: 'compras' },
  ];

  if (!currentUser) {
    return null; // Or a loading skeleton for nav
  }

  return (
    <nav className="flex flex-col items-center gap-10 py-10 relative z-10 h-full">
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="/dashboard"
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-mango transition-all hover:scale-105 active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-7 w-7"
            >
              <path d="M12 2L3 9v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="sr-only">Botanical</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">Botanical</TooltipContent>
      </Tooltip>
      <div className="flex flex-col gap-6 w-full px-4">
        {navItems.map((item) => {
          if (item.role && item.role !== currentUser.role) {
            return null;
          }
          const isActive = pathname === item.href;
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex h-14 w-14 mx-auto items-center justify-center rounded-2xl transition-all relative',
                    isActive 
                      ? 'bg-primary/10 text-primary shadow-sm' 
                      : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  {isActive && (
                    <div className="absolute -left-4 w-1.5 h-8 bg-primary rounded-r-full transition-all shadow-mango" />
                  )}
                  <item.icon className={cn("h-6 w-6 transition-all duration-300", isActive && "stroke-[2.5px]")} />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-bold uppercase tracking-wider text-[10px]">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </nav>
  );
}
