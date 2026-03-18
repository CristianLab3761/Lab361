import { TooltipProvider } from '@/components/ui/tooltip';
import { AppProvider } from '@/context/app-context';
import { SidebarNav } from '@/components/app/sidebar-nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProvider>
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
    </AppProvider>
  );
}
