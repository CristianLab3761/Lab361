'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/app/header';
import { OrdersTable } from '@/components/app/orders-table';
import { PageHeader } from '@/components/app/page-header';
import { useAppContext } from '@/context/app-context';

export default function OrdenesPage() {
    const { currentUser } = useAppContext();

    if (currentUser.role === 'solicitante') {
        return (
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Header breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Órdenes' }]} />
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-20">
                <div className="flex flex-col items-center gap-1 text-center">
                  <h3 className="text-2xl font-bold tracking-tight">Acceso Restringido</h3>
                  <p className="text-sm text-muted-foreground">
                    Esta sección solo está disponible para el equipo de compras.
                  </p>
                </div>
              </div>
          </main>
        );
      }

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Órdenes' }]} />
      <PageHeader title="Historial de Órdenes de Compra" description="Consulta todas las órdenes de compra generadas."/>
      <Card>
        <CardContent className="p-0">
          <OrdersTable />
        </CardContent>
      </Card>
    </main>
  );
}
