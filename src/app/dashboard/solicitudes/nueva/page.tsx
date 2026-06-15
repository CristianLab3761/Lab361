'use client';

import { NewRequestDialog } from '@/components/app/new-request-dialog';
import { Header } from '@/components/app/header';
import { PageHeader } from '@/components/app/page-header';
import { useRouter } from 'next/navigation';

export default function NuevaRequisicionPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] bg-slate-50">
      <Header breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Requisiciones', href: '/dashboard/solicitudes' },
        { label: 'Nueva Requisición' }
      ]} />
      
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 bg-white shadow-sm border-t border-slate-200">
          <NewRequestDialog 
            isStandalonePage={true} 
            open={true} 
            onOpenChange={(open) => {
              if (!open) {
                router.push('/dashboard/solicitudes');
              }
            }} 
          />
        </div>
      </div>
    </div>
  );
}
