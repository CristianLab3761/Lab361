'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/app/header';
import { RequestsTable } from '@/components/app/requests-table';
import { useAppContext } from '@/context/app-context';
import { NewRequestDialog } from '@/components/app/new-request-dialog';
import { PageHeader } from '@/components/app/page-header';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportRequisitionsToCSV } from '@/lib/export-utils';

export default function SolicitudesPage() {
  const { currentUser, solicitudes } = useAppContext();
  
  if (!currentUser) {
    return null; // Or a loading skeleton
  }

  const exportButton = (
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => exportRequisitionsToCSV(solicitudes)}
      className="bg-white border-slate-200 text-black hover:bg-slate-50 transition-all font-medium h-9"
    >
      <Download className="mr-2 h-4 w-4" />
      Descargar Reporte Excel
    </Button>
  );

  if (currentUser.role === 'solicitante') {
    return (
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Header breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Mis Requisiciones' }]} />
        <PageHeader title="Mis Requisiciones" description="Revisa el estado de todas tus requisiciones de compra.">
          <div className="flex gap-2">
            {exportButton}
            <NewRequestDialog />
          </div>
        </PageHeader>
        <Card>
          <CardContent className="p-0">
            <RequestsTable solicitanteId={currentUser.id} />
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Requisiciones' }]} />
      <PageHeader title="Gestión de Requisiciones" description="Revisa, aprueba y gestiona todas las requisiciones de compra.">
        {exportButton}
      </PageHeader>
      <Tabs defaultValue="vigente">
        <TabsList className="bg-slate-100 p-1 border border-slate-200">
          <TabsTrigger value="vigente" className="data-[state=active]:bg-white data-[state=active]:text-black transition-all">Vigentes</TabsTrigger>
          <TabsTrigger value="anulada" className="data-[state=active]:bg-white data-[state=active]:text-black transition-all">Anuladas</TabsTrigger>
          <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-black transition-all">Todas</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <RequestsTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="vigente">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <RequestsTable filterStatus="vigente" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="anulada">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <RequestsTable filterStatus="anulada" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
