'use client';

import { useAppContext } from '@/context/app-context';
import { Header } from '@/components/app/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RequestsTable } from '@/components/app/requests-table';
import { NewRequestDialog } from '@/components/app/new-request-dialog';
import { 
  ShoppingCart, TrendingUp, CheckCircle2, AlertTriangle, ArrowRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  getSpendByCategory, getTopSuppliers, getMonthlySpendTrend, 
  getCycleTimeStats, getSavingsData, USD_TO_CLP, UF_TO_CLP 
} from '@/lib/dashboard-utils';
import { SpendByCategoryChart, MonthlySpendChart, TopSuppliersChart } from '@/components/app/dashboard-charts';
import { BudgetStatusWidget, CurrencyMonitor, UpcomingDeliveriesWidget, StatCardMini } from '@/components/app/dashboard-widgets';
import { PendingRequisitionsWidget } from '@/components/app/pending-requisitions-widget';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Solicitud, Presupuesto } from '@/lib/types';

export default function DashboardPage() {
  const { currentUser, solicitudes, presupuestos } = useAppContext();

  if (!currentUser) return null;

  const userRole = (currentUser.role || '').toLowerCase();
  const isCompras = userRole === 'compras' || userRole === 'comprador' || userRole === 'admin';
  const userSolicitudes = solicitudes.filter((s: Solicitud) => s.solicitanteId === currentUser.id);
  const displaySolicitudes = isCompras ? solicitudes : userSolicitudes;
  
  // High-level Stats
  const cycleTime = getCycleTimeStats(solicitudes);
  const { savings, savingsPercent } = getSavingsData(solicitudes);
  const spendByCategory = getSpendByCategory(displaySolicitudes);
  const topSuppliers = getTopSuppliers(displaySolicitudes);
  const monthlySpend = getMonthlySpendTrend(displaySolicitudes);

  const MOCK_BUDGETS = [
    { id: 'b1', name: 'Operaciones', monto: 5000000, spent: 3200000, percent: 64 },
    { id: 'b2', name: 'Logística', monto: 2000000, spent: 1850000, percent: 92.5 },
    { id: 'b3', name: 'Administración', monto: 1500000, spent: 450000, percent: 30 },
  ];

  const budgetStats = presupuestos.length > 0 ? presupuestos.map((p: Presupuesto) => {
    const spent = solicitudes
      .filter((s: Solicitud) => (s["Centro de Costos"] || s.centroCostos) === p.name)
      .reduce((acc: number, s: Solicitud) => acc + (Number(s.totalGlobal) || 0), 0);
    return { ...p, spent, percent: p.monto > 0 ? (spent / p.monto) * 100 : 0 };
  }) : MOCK_BUDGETS;

  return (
    <main className="grid flex-1 items-start gap-8 p-4 sm:px-6 sm:py-6 md:gap-10 max-w-[1600px] mx-auto w-full bg-[#f8fafc]/50 min-h-screen">
      <Header breadcrumbs={[{ label: 'Dashboard Intelligence' }]} />
      
      {/* Welcome & Global Actions */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 border-b border-slate-200">
        <div className="space-y-1">
           <h1 className="text-4xl font-black tracking-tighter text-black flex items-baseline gap-2">
               ESTADO <span className="text-slate-400">/</span> <span className="bg-gradient-to-r from-black to-slate-600 bg-clip-text text-transparent">OVERVIEW</span>
           </h1>
           <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.3em]">
               {format(new Date(), 'EEEE, d MMMM yyyy', { locale: es })}
           </p>
        </div>
        <div className="flex items-center gap-3">
           <NewRequestDialog />
           {isCompras && (
                <div className="hidden sm:flex items-center gap-2 px-6 py-2 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-black/20">
                    <TrendingUp className="h-4 w-4" /> Power User Mode
                </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Left Column: Stats & Primary KPI Area (3/4 on Desktop) */}
        <div className="xl:col-span-3 space-y-8">
          
          {/* Main KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCardMini 
                title="Spend Total (CLP)" 
                value={new Intl.NumberFormat('es-CL').format(displaySolicitudes.reduce((acc: number, s: Solicitud) => acc + (Number(s.totalGlobal) || 0), 0))}
                subtext="Costo global acumulado"
                trend="up"
            />
            <StatCardMini 
                title="Requisiciones" 
                value={displaySolicitudes.length}
                subtext={isCompras ? "Total solicitudes activas" : "Tus solicitudes enviadas"}
            />
            <StatCardMini 
                title="Ahorro Logrado" 
                value={`${Math.round(savingsPercent)}%`}
                subtext={`$${new Intl.NumberFormat('es-CL').format(savings)} CLP`}
                trend="up"
            />
            <StatCardMini 
                title="Tiempo de Ciclo" 
                value={`${cycleTime} d`}
                subtext="Promedio creación-OC"
                trend="down"
            />
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-slate-100/50 p-1 rounded-xl h-auto">
                <TabsTrigger value="overview" className="rounded-lg px-6 py-2 text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Analytics</TabsTrigger>
                <TabsTrigger value="table" className="rounded-lg px-6 py-2 text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Operations</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="mt-0 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart 1: Month Trend */}
                <Card className="border-slate-200/60 shadow-xl shadow-slate-200/20 bg-white group overflow-hidden">
                  <div className="h-1 w-full bg-black" />
                  <CardHeader>
                    <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Tendencia Mensual</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MonthlySpendChart data={monthlySpend} />
                  </CardContent>
                </Card>

                {/* Chart 2: Category Distribution */}
                <Card className="border-slate-200/60 shadow-xl shadow-slate-200/20 bg-white group overflow-hidden">
                  <div className="h-1 w-full bg-teal-400" />
                  <CardHeader>
                    <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Gasto por Categoría</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SpendByCategoryChart data={spendByCategory} />
                  </CardContent>
                </Card>
              </div>

              {/* Supporter Chart */}
              <Card className="border-slate-200/60 shadow-xl shadow-slate-200/20 bg-white group overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Top 5 Proveedores</CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest mt-1 text-slate-400">Basado en volumen de gasto total</CardDescription>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                    <ShoppingCart className="h-4 w-4 text-black" />
                  </div>
                </CardHeader>
                <CardContent>
                  <TopSuppliersChart data={topSuppliers} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="table" className="mt-0">
               <Card className="border-slate-200/60 shadow-2xl shadow-slate-200/40 overflow-hidden bg-white">
                  <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl text-black font-black tracking-tighter uppercase italic">
                             Logística de Compras
                        </CardTitle>
                        <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">{isCompras ? 'Gestión global de suministros' : 'Tus transacciones recientes'}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 sm:p-6">
                    <RequestsTable 
                        solicitanteId={isCompras ? undefined : currentUser.id} 
                    />
                  </CardContent>
               </Card>
            </TabsContent>
          </Tabs>

        </div>

        {/* Right Column: Widgets & Alerts (1/4 on Desktop) */}
        <div className="space-y-6">
          {isCompras && (
            <PendingRequisitionsWidget 
              solicitudes={solicitudes} 
              onAction={() => {
                // We could programmatically switch the tab to 'table' and filter by 'vigente'
                // For now, it's just a visual notification
              }}
            />
          )}
          <CurrencyMonitor />
          
          <BudgetStatusWidget budgets={budgetStats} />
          
          <UpcomingDeliveriesWidget solicitudes={solicitudes} />

          {/* Activity Feed Static Mock */}
          <Card className="border-slate-200/60 shadow-sm bg-white overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500">Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 px-0">
               <div className="space-y-0 text-xs">
                  <div className="p-3 border-l-4 border-emerald-500 bg-emerald-50/30 flex gap-3 items-start">
                     <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
                     <div>
                        <p className="font-black uppercase tracking-tight text-slate-800">Orden Procesada</p>
                        <p className="text-[10px] text-slate-500">REQ-002 ha sido asociada a OC-44</p>
                     </div>
                  </div>
                  <div className="p-3 border-l-4 border-amber-500 bg-amber-50/30 flex gap-3 items-start">
                     <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                     <div>
                        <p className="font-black uppercase tracking-tight text-slate-800">Proveedor Pendiente</p>
                        <p className="text-[10px] text-slate-500">Falta email en ficha de "Acme Corp"</p>
                     </div>
                  </div>
               </div>
               <div className="p-3">
                  <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black">
                    Ver todo <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
               </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </main>
  );
}

// Subcomponent for Stats to keep code clean
function StatCard({ title, value, icon: Icon, colorClass, trend }: { title: string, value: number, icon: any, colorClass: string, trend: string }) {
    return (
        <Card className="relative overflow-hidden border-slate-200/60 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 bg-white/80 backdrop-blur-xl group">
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-slate-500 tracking-tight uppercase">{title}</p>
                        <p className="text-4xl font-extrabold text-slate-800 tracking-tighter">{value}</p>
                    </div>
                    <div className={cn("p-3 rounded-2xl ring-1 shadow-sm transition-transform group-hover:scale-110", colorClass)}>
                        <Icon className="h-6 w-6" strokeWidth={2.5} />
                    </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-slate-500 font-medium">
                    {trend}
                </div>
            </CardContent>
        </Card>
    );
}
