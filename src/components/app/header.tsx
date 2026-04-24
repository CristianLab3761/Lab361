import Link from 'next/link';
import { Home, FileText, Package, PanelLeft, UploadCloud, Settings } from 'lucide-react';
import React from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/app/user-nav';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

type HeaderProps = {
  breadcrumbs: { label: string; href?: string }[];
};

export function Header({ breadcrumbs }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center gap-4 border-b border-slate-200 bg-white/80 px-6 backdrop-blur-xl sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-8 sm:mt-6 transition-all duration-300">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden border-slate-200 bg-white hover:bg-slate-50 rounded-xl shadow-sm transition-transform active:scale-95">
            <PanelLeft className="h-5 w-5 text-slate-500" />
            <span className="sr-only">Menú</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs bg-white border-r border-slate-200 text-slate-900 p-8 flex flex-col gap-10">
          <Link
            href="/dashboard"
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-mango transition-all hover:scale-110 active:scale-95 self-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8"
            >
              <path d="M12 2L3 9v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </Link>
          <nav className="flex flex-col gap-8 text-lg font-bold uppercase tracking-wider text-slate-900">
            <Link href="/dashboard" className="transition-all hover:text-primary">Dashboard</Link>
            <Link href="/dashboard/solicitudes" className="transition-all hover:text-primary">Solicitudes</Link>
            <Link href="/dashboard/catalogos" className="transition-all hover:text-primary">Catálogos</Link>
            <Link href="/dashboard/proveedores" className="transition-all hover:text-primary">Proveedores</Link>
            <Link href="/dashboard/importar" className="transition-all hover:text-primary">Importar</Link>
          </nav>
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 items-center gap-6 px-4">
        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-primary transition-colors">
                Botanical
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={`${index}-${crumb.label}`}>
                <BreadcrumbSeparator className="text-slate-200" />
                <BreadcrumbItem>
                  {index === breadcrumbs.length - 1 ? (
                    <BreadcrumbPage className="text-[10px] font-bold uppercase tracking-wider text-slate-900 border-b-2 border-primary/40 pb-0.5">
                      {crumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <Link href={crumb.href || '#'} className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-primary transition-colors">{crumb.label}</Link>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-4 px-8 border-l border-slate-100">
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sync: Active</span>
          <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Mango Intelligence</span>
        </div>
        <UserNav />
      </div>
    </header>
  );
}
