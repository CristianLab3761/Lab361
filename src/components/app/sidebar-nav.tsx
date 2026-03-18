'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, FileText, Package, UploadCloud, type LucideIcon } from 'lucide-react';
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
    { href: '/dashboard/solicitudes', label: 'Solicitudes', icon: FileText },
    { href: '/dashboard/ordenes', label: 'Órdenes de Compra', icon: Package },
    { href: '/dashboard/importar', label: 'Importar', icon: UploadCloud, role: 'compras' },
  ];

  return (
    <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors md:h-8 md:w-8"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M5.5 22v-6.5H2V6.021a2 2 0 0 1 1.28-1.852L12 1l8.72 3.169A2 2 0 0 1 22 6.021V15.5h-3.5V22h-4v-6.5h-5V22h-4Z" />
            </svg>
            <span className="sr-only">OrdenaPro</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">OrdenaPro</TooltipContent>
      </Tooltip>
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
                  'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
                  isActive && 'bg-primary/10 text-primary'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="sr-only">{item.label}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}
