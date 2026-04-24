'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Users, CreditCard, PieChart, Building2, Building, ShieldAlert } from 'lucide-react';
import { Header } from '@/components/app/header';
import { PageHeader } from '@/components/app/page-header';
import { useAppContext } from '@/context/app-context';

const adminNavItems = [
  {
    title: 'Proveedores',
    href: '/dashboard/administracion/proveedores',
    icon: Users,
  },
  {
    title: 'Cuentas Contables',
    href: '/dashboard/administracion/cuentas',
    icon: CreditCard,
  },
  {
    title: 'Presupuestos',
    href: '/dashboard/administracion/presupuestos',
    icon: PieChart,
  },
  {
    title: 'Centros de Negocios',
    href: '/dashboard/administracion/centros-negocios',
    icon: Building2,
  },
  {
    title: 'Centros de Costos',
    href: '/dashboard/administracion/centros-costos',
    icon: Building,
  },
];

export default function AdministracionLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser } = useAppContext();

  if (!currentUser || currentUser.role !== 'compras') {
    return (
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Header breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Administración' }]} />
        <div className="flex flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/30 backdrop-blur-sm p-12 py-24 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500 mb-6 shadow-sm">
                <ShieldAlert className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">Acceso Restringido</h3>
            <p className="text-md text-slate-500 mt-2 max-w-sm mb-8">
              Esta sección solo está disponible para el equipo de compras.
            </p>
        </div>
      </main>
    );
  }

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 max-w-7xl mx-auto w-full">
      <Header breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Administración' }]} />
      <PageHeader title="Configuración" description="Gestiona los datos maestros y catálogos del sistema." />
      
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0 pb-16">
        <aside className="lg:w-1/4">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                    isActive 
                       ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20" 
                       : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-slate-400")} />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="flex-1 lg:max-w-4xl">
           <div className="bg-white/60 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-sm p-1">
             {children}
           </div>
        </div>
      </div>
    </main>
  );
}
