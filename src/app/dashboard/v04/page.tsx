'use client';

import * as React from 'react';
import { Header } from '@/components/app/header';
import { PageHeader } from '@/components/app/page-header';
import { V04Table } from '@/components/app/v04-table';
import { useAppContext } from '@/context/app-context';
import { redirect } from 'next/navigation';

export default function V04HistoryPage() {
  const { currentUser } = useAppContext();

  React.useEffect(() => {
    if (currentUser && currentUser.role !== 'compras') {
      redirect('/dashboard');
    }
  }, [currentUser]);

  if (!currentUser) return null;

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Historial V04' }]} />
      <PageHeader 
        title="Historial de Requisiciones V04" 
        description="Consulta las requisiciones generadas en el sistema anterior (Versión 0.4)." 
      />
      
      <V04Table />
    </main>
  );
}
