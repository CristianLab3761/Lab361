'use client';

import { FilePlus2 } from 'lucide-react';

import { useAppContext } from '@/context/app-context';
import { Header } from '@/components/app/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RequestsTable } from '@/components/app/requests-table';
import { NewRequestDialog } from '@/components/app/new-request-dialog';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { currentUser, solicitudes } = useAppContext();

  const userSolicitudes = solicitudes.filter(s => s.solicitanteId === currentUser.id);
  const pendingSolicitudes = solicitudes.filter(s => s.status === 'pendiente');

  const stats = {
    total: solicitudes.length,
    pending: pendingSolicitudes.length,
    approved: solicitudes.filter(s => s.status === 'aprobada').length,
    processed: solicitudes.filter(s => s.status === 'procesada').length,
  };

  const userStats = {
    total: userSolicitudes.length,
    pending: userSolicitudes.filter(s => s.status === 'pendiente').length,
    approved: userSolicitudes.filter(s => s.status === 'aprobada').length,
    processed: userSolicitudes.filter(s => s.status === 'procesada').length,
  };

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header breadcrumbs={[{ label: 'Dashboard' }]} />
      <div className="grid gap-4 md:gap-8">
        {currentUser.role === 'compras' ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Solicitudes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pending}</div>
                  <p className="text-xs text-muted-foreground">Listas para revisar</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.approved}</div>
                  <p className="text-xs text-muted-foreground">Esperando generación de OC</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Procesadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.processed}</div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Solicitudes Pendientes</CardTitle>
                <CardDescription>
                  Estas son las solicitudes que requieren tu atención.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RequestsTable filterStatus="pendiente" />
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Mis Solicitudes</h1>
                <NewRequestDialog />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Enviadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">En Revisión</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats.pending}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats.approved + userStats.processed}</div>
                </CardContent>
              </Card>
            </div>
            {userSolicitudes.length > 0 ? (
                 <Card>
                    <CardHeader>
                        <CardTitle>Historial de Mis Solicitudes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RequestsTable solicitanteId={currentUser.id} />
                    </CardContent>
                 </Card>
            ) : (
              <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-20">
                <div className="flex flex-col items-center gap-1 text-center">
                  <h3 className="text-2xl font-bold tracking-tight">No tienes solicitudes</h3>
                  <p className="text-sm text-muted-foreground">
                    Empieza creando tu primera solicitud de compra.
                  </p>
                  <div className="mt-4">
                    <NewRequestDialog />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
