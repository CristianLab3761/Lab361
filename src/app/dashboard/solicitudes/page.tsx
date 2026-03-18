'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/app/header';
import { RequestsTable } from '@/components/app/requests-table';
import { useAppContext } from '@/context/app-context';
import { NewRequestDialog } from '@/components/app/new-request-dialog';
import { PageHeader } from '@/components/app/page-header';

export default function SolicitudesPage() {
  const { currentUser } = useAppContext();
  
  if (!currentUser) {
    return null; // Or a loading skeleton
  }

  if (currentUser.role === 'solicitante') {
    return (
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Header breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Mis Solicitudes' }]} />
        <PageHeader title="Mis Solicitudes" description="Revisa el estado de todas tus solicitudes de compra.">
          <NewRequestDialog />
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
      <Header breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Solicitudes' }]} />
      <PageHeader title="Gestión de Solicitudes" description="Revisa, aprueba y gestiona todas las solicitudes de compra." />
      <Tabs defaultValue="pendiente">
        <TabsList>
          <TabsTrigger value="pendiente">Pendientes</TabsTrigger>
          <TabsTrigger value="aprobada">Aprobadas</TabsTrigger>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="procesada">Procesadas</TabsTrigger>
          <TabsTrigger value="rechazada">Rechazadas</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Card>
            <CardContent className="p-0">
              <RequestsTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pendiente">
          <Card>
            <CardContent className="p-0">
              <RequestsTable filterStatus="pendiente" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="aprobada">
          <Card>
            <CardContent className="p-0">
              <RequestsTable filterStatus="aprobada" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="procesada">
          <Card>
            <CardContent className="p-0">
              <RequestsTable filterStatus="procesada" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="rechazada">
          <Card>
            <CardContent className="p-0">
              <RequestsTable filterStatus="rechazada" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
