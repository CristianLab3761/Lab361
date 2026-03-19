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
      <div className="flex min-h-screen w-full">
        <div className="hidden sm:flex flex-col items-center gap-4 px-2 sm:py-5 w-14 border-r bg-background">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <div className="flex-1 p-4 sm:p-6">
          <Skeleton className="h-14 w-full border-b" />
          <div className="mt-8 grid gap-4 md:gap-8">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
          <SidebarNav />
        </aside>
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          {children}
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
