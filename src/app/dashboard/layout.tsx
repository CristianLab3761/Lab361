'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAppContext } from '@/context/app-context';
import { SidebarNav } from '@/components/app/sidebar-nav';
import { Skeleton } from '@/components/ui/skeleton';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.replace('/login');
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || !currentUser) {
    return (
      <div className="flex min-h-screen w-full bg-background/50">
        <div className="hidden sm:flex flex-col items-center gap-4 px-2 sm:py-5 w-20 border-r border-border bg-primary/10">
          <Skeleton className="h-10 w-10 rounded-xl bg-primary/20" />
          <Skeleton className="h-10 w-10 rounded-xl bg-primary/20" />
          <Skeleton className="h-10 w-10 rounded-xl bg-primary/20" />
        </div>
        <div className="flex-1 p-4 sm:p-10">
          <Skeleton className="h-32 w-full rounded-2xl bg-primary/5 mb-10" />
          <div className="grid gap-6">
            <Skeleton className="h-64 w-full rounded-2xl bg-primary/5" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col font-body bg-background text-foreground relative selection:bg-primary/30">
        <aside className="fixed inset-y-0 left-0 z-20 hidden w-24 flex-col border-r border-slate-200 bg-white sm:flex shadow-mango overflow-hidden transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          <SidebarNav />
        </aside>
        <div className="flex flex-col sm:gap-4 sm:py-6 sm:pl-24 relative z-10 transition-all duration-500">
          <main className="flex-1 px-4 sm:px-10 max-w-[1700px] mx-auto w-full animate-fade-in-up">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutContent>{children}</DashboardLayoutContent>;
}
