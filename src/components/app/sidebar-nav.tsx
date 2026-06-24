'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, FileText, Package, UploadCloud, Settings, Users, Globe, Moon, Sun, type LucideIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/context/app-context';
import { useTheme } from 'next-themes';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  role?: 'compras' | 'solicitante';
}

export function SidebarNav() {
  const pathname = usePathname();
  const { currentUser } = useAppContext();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/solicitudes', label: 'Requisiciones', icon: FileText },
    { href: '/dashboard/ordenes', label: 'Órdenes de Compra', icon: Package, role: 'compras' },
    { href: '/dashboard/comex', label: 'Comex', icon: Globe, role: 'compras' },
    { href: '/dashboard/materiales', label: 'Materiales', icon: Package, role: 'compras' },
    { href: '/dashboard/administracion/usuarios', label: 'Usuarios', icon: Users, role: 'compras' },
    { href: '/dashboard/importar', label: 'Importar', icon: UploadCloud, role: 'compras' },
    { href: '/dashboard/administracion', label: 'Administración', icon: Settings, role: 'compras' },
    { href: '/dashboard/v04', label: 'Historial V04', icon: FileText, role: 'compras' },
  ];

  if (!currentUser) {
    return null;
  }

  return (
    <nav className="flex flex-col items-center gap-10 py-10 relative z-10 h-full">
      {/* Logo */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="/dashboard"
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95"
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

      {/* Nav items */}
      <div className="flex flex-col gap-6 w-full px-4 flex-1">
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
                    'group flex h-11 w-11 mx-auto items-center justify-center rounded-xl transition-all relative',
                    isActive
                      ? 'bg-primary/15 text-primary dark:bg-primary/20 dark:text-blue-400'
                      : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:text-neutral-500 dark:hover:bg-white/8 dark:hover:text-neutral-200'
                  )}
                >
                  {isActive && (
                    <div className="absolute -left-4 w-1 h-7 bg-primary rounded-r-full transition-all shadow-sm shadow-primary/50" />
                  )}
                  <item.icon className={cn("h-5 w-5 transition-all duration-300", isActive && "stroke-[2.5px]")} />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-bold uppercase tracking-wider text-[10px]">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {/* Dark mode toggle */}
      <div className="pb-4 flex flex-col items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={toggleTheme}
              aria-label="Cambiar modo de color"
              className={cn(
                'relative flex h-14 w-8 flex-col items-center justify-center rounded-full border transition-all duration-300 cursor-pointer',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                isDark
                  ? 'border-white/8 bg-[#1a1a1a] hover:bg-[#222]'
                  : 'border-slate-200 bg-slate-100 hover:bg-slate-200'
              )}
            >
              {/* Track */}
              <div className={cn(
                'absolute inset-0 rounded-full transition-all duration-300',
                isDark
                  ? 'bg-gradient-to-b from-[#0a0a0f] to-[#12121a]'
                  : 'bg-gradient-to-b from-blue-50 to-sky-100'
              )} />

              {/* Icons */}
              <Sun
                className={cn(
                  'absolute top-2 h-3 w-3 transition-all duration-300 z-10',
                  isDark ? 'text-slate-600 scale-90 opacity-50' : 'text-amber-500 scale-100 opacity-100'
                )}
              />
              <Moon
                className={cn(
                  'absolute bottom-2 h-3 w-3 transition-all duration-300 z-10',
                  isDark ? 'text-indigo-300 scale-100 opacity-100' : 'text-slate-400 scale-90 opacity-40'
                )}
              />

              {/* Thumb */}
              <div className={cn(
                'absolute h-5 w-5 rounded-full shadow-md transition-all duration-300 z-20',
                isDark
                  ? 'bg-indigo-400 translate-y-[14px] shadow-indigo-500/50'
                  : 'bg-white -translate-y-[14px] shadow-sky-200/80'
              )} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-bold uppercase tracking-wider text-[10px]">
            {isDark ? 'Modo Claro' : 'Modo Oscuro'}
          </TooltipContent>
        </Tooltip>
      </div>
    </nav>
  );
}
