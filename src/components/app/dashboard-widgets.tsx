'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, TrendingDown, DollarSign, Calendar, 
  ArrowRight, RefreshCw, AlertTriangle, CheckCircle2 
} from 'lucide-react';
import { format, isAfter, isBefore, addDays, parseISO } from 'date-fns';
import { Solicitud } from '@/lib/types';
import { cn } from '@/lib/utils';

export function BudgetStatusWidget({ budgets }: { budgets: any[] }) {
  return (
    <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-50">
        <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Estado de Presupuestos</CardTitle>
        <CardDescription className="text-[11px] text-slate-500">Gasto vs. Presupuesto por departamento.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {budgets.length > 0 ? budgets.map((b) => (
          <div key={b.id} className="space-y-3">
            <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
              <span className="text-slate-700">{b.name}</span>
              <span className="text-primary">{Math.round(b.percent)}%</span>
            </div>
            <Progress 
                value={b.percent} 
                className="h-2 bg-slate-100" 
                indicatorClassName={cn(
                    "transition-all duration-700",
                    b.percent > 90 ? "bg-red-500" : b.percent > 70 ? "bg-primary shadow-sm" : "bg-accent shadow-sm"
                )}
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-tight">
              <span>{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(b.spent)}</span>
              <span className="opacity-60">Meta: {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(b.monto)}</span>
            </div>
          </div>
        )) : (
            <div className="p-8 text-center text-slate-300 text-[10px] font-bold uppercase tracking-wider">No hay datos activos</div>
        )}
      </CardContent>
    </Card>
  );
}

export function CurrencyMonitor() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://mindicador.cl/api')
      .then(res => res.json())
      .then(json => {
        setData({
          usd: json.dolar.valor,
          uf: json.uf.valor,
          euro: json.euro.valor
        });
        setLoading(false);
      })
      .catch(() => {
        setData({ usd: 955.4, uf: 38210.5, euro: 1042.2 });
        setLoading(false);
      });
  }, []);

  return (
    <Card className="border-none shadow-mango bg-gradient-to-br from-primary via-primary to-accent text-white relative overflow-hidden group">
      <div className="absolute top-0 right-0 h-48 w-48 bg-white/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none transition-all duration-1000" />
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 relative z-10">
        <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-white/90">Mercado Financiero</CardTitle>
        <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
      </CardHeader>
      <CardContent className="pt-6 space-y-8 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-white/60 uppercase tracking-wider">USD</p>
            <p className="text-2xl font-bold tabular-nums tracking-tighter text-white">${data?.usd?.toLocaleString('es-CL') || '---'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-white/60 uppercase tracking-wider">EURO</p>
            <p className="text-2xl font-bold tabular-nums tracking-tighter text-white/90">${data?.euro?.toLocaleString('es-CL') || '---'}</p>
          </div>
          <div className="col-span-2 sm:col-span-1 space-y-1">
            <p className="text-[9px] font-bold text-white/60 uppercase tracking-wider">UF</p>
            <p className="text-xl font-bold tabular-nums tracking-tighter text-white/80">${data?.uf?.toLocaleString('es-CL') || '---'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-bold text-white/40 uppercase tracking-wider">
          <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} /> {loading ? 'Sincronizando...' : `Actualizado @ ${format(new Date(), 'HH:mm')}`}
        </div>
      </CardContent>
    </Card>
  );
}

export function UpcomingDeliveriesWidget({ solicitudes }: { solicitudes: Solicitud[] }) {
  const upcoming = solicitudes
    .filter(s => s["Fecha Entrega"] && s.status !== 'procesada')
    .map(s => ({
      ...s,
      deliveryDate: parseISO(s["Fecha Entrega"]!)
    }))
    .filter(s => isAfter(s.deliveryDate, new Date()) && isBefore(s.deliveryDate, addDays(new Date(), 7)))
    .sort((a, b) => a.deliveryDate.getTime() - b.deliveryDate.getTime());

  return (
    <Card className="border-slate-200 shadow-sm bg-white">
      <CardHeader className="border-b border-slate-50">
        <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" /> Próximas Entregas
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 px-0">
        <div className="divide-y divide-slate-50">
          {upcoming.length > 0 ? upcoming.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-5 hover:bg-slate-50 transition-all duration-300 group cursor-default">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-900 truncate max-w-[150px] group-hover:text-primary transition-colors">{s["Proveedor"] || s.proveedor}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">ID: {s["N° Requisición"] || s.id}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold text-accent uppercase tracking-tight px-3 py-1 bg-accent/5 rounded-lg border border-accent/20">
                    {format(s.deliveryDate, 'dd MMM')}
                </p>
              </div>
            </div>
          )) : (
            <div className="py-20 text-center text-slate-200 text-[10px] font-bold uppercase tracking-wider">Cero Entregas</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function StatCardMini({ title, value, subtext, trend }: { title: string, value: string | number, subtext: string, trend?: 'up' | 'down' }) {
    return (
        <Card className="border-slate-200 shadow-sm bg-white relative overflow-hidden group hover:border-primary/30 transition-all duration-700">
            <div className="absolute inset-x-0 bottom-0 h-1 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-8">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-3 group-hover:text-primary transition-colors">{title}</p>
                <div className="flex items-baseline gap-4">
                    <p className="text-4xl font-bold text-slate-900 tracking-tight transition-transform origin-left">{value}</p>
                    {trend && (
                        <div className={cn(
                            "flex items-center gap-1 rounded-md px-2 py-1 text-[9px] font-bold",
                            trend === 'up' ? "bg-accent/10 text-accent border border-accent/20" : "bg-red-50 text-red-600 border border-red-100"
                        )}>
                            {trend === 'up' ? '▲' : '▼'}
                            {trend === 'up' ? 'UP' : 'DN'}
                        </div>
                    )}
                </div>
                <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-wider opacity-60 group-hover:opacity-100">{subtext}</p>
            </CardContent>
        </Card>
    );
}
