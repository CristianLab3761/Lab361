'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/app/header';
import { OrdersTable } from '@/components/app/orders-table';
import { PageHeader } from '@/components/app/page-header';
import { useAppContext } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import { FileDown, Database, LayoutDashboard, History } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OCV04Table } from '@/components/app/oc-v04-table';
import { OCV05Table } from '@/components/app/oc-v05-table';

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
        <PageHeader title="Gestión de Órdenes de Compra" description="Consulta y administra todas las órdenes generadas en las distintas versiones del sistema."/>
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

      <Tabs defaultValue="v05" className="w-full">
        <TabsList className="bg-slate-100/50 border border-slate-200 p-1 h-12 rounded-xl mb-4">
          <TabsTrigger value="v05" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary py-2 px-6">
            <LayoutDashboard className="h-4 w-4" />
            <div className="flex flex-col items-start leading-tight">
              <span className="text-xs font-bold uppercase">Versión V05</span>
              <span className="text-[9px] opacity-60">Estructurado JSON</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="standard" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary py-2 px-6">
            <Database className="h-4 w-4" />
            <div className="flex flex-col items-start leading-tight">
              <span className="text-xs font-bold uppercase">Vista Estándar</span>
              <span className="text-[9px] opacity-60">Legacy App</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="v04" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary py-2 px-6">
            <History className="h-4 w-4" />
            <div className="flex flex-col items-start leading-tight">
              <span className="text-xs font-bold uppercase">Historial V04</span>
              <span className="text-[9px] opacity-60">36 Columnas Sheet</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="v05" className="mt-0">
          <OCV05Table />
        </TabsContent>

        <TabsContent value="standard" className="mt-0">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-0">
              <OrdersTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="v04" className="mt-0">
          <OCV04Table />
        </TabsContent>
      </Tabs>
    </main>
  );
}
