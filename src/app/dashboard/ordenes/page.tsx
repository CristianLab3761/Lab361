'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/app/header';
import { OrdersTable } from '@/components/app/orders-table';
import { PageHeader } from '@/components/app/page-header';
import { useAppContext } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';

export default function OrdenesPage() {
    const { currentUser, ordenesCompra } = useAppContext();

    const handleExportCSV = () => {
      const headers = ['ID OC', 'ID Requisicion', 'Fecha', 'Proveedor', 'Estado', 'Moneda', 'Total'];
      const rows = ordenesCompra.map(o => [
        o.id,
        o.solicitudId,
        o.createdAt,
        o.supplierName,
        o.status || o.estatus,
        o.moneda,
        o.totalGlobal || o.totalCost
      ]);
      
      const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `reporte_ordenes_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    if (!currentUser || currentUser.role === 'solicitante') {
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
      <div className="flex items-center justify-between">
        <PageHeader title="Historial de Órdenes de Compra" description="Consulta todas las órdenes de compra generadas."/>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 gap-1 rounded-sm text-[10px] font-black uppercase tracking-widest border-slate-200"
          onClick={handleExportCSV}
        >
          <FileDown className="h-3.5 w-3.5" />
          Descargar Reporte Global
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <OrdersTable />
        </CardContent>
      </Card>
    </main>
  );
}
