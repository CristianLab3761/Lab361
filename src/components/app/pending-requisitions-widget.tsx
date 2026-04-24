'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  ArrowRight, 
  ShoppingCart, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { Solicitud } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface PendingRequisitionsWidgetProps {
  solicitudes: Solicitud[];
  onAction?: () => void;
}

export function PendingRequisitionsWidget({ solicitudes, onAction }: PendingRequisitionsWidgetProps) {
  const pendingRequests = solicitudes.filter(s => 
    (s.status?.toLowerCase() === 'vigente' || s.status?.toLowerCase() === 'pendiente')
  );

  if (pendingRequests.length === 0) {
    return (
      <Card className="border-slate-200/60 shadow-sm bg-white overflow-hidden">
        <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
            <Bell className="h-6 w-6 text-slate-300" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-tight text-slate-400">Sin Pendientes</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Todas las requisiciones han sido procesadas</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-2xl shadow-primary/10 bg-white overflow-hidden relative group">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <Bell className="h-4 w-4 text-primary animate-bounce" />
          </div>
          <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Notificaciones de Compra</CardTitle>
        </div>
        <Badge className="bg-primary text-white font-black text-[10px] px-2 py-0.5 rounded-full border-none shadow-lg shadow-primary/30">
          {pendingRequests.length} NUEVAS
        </Badge>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-3">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-slate-100/50 transition-colors">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center border border-slate-200 shadow-sm shrink-0">
                <ShoppingCart className="h-5 w-5 text-slate-900" />
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <p className="text-xs font-black text-slate-900 uppercase tracking-tight truncate">Requisiciones Pendientes</p>
                <div className="flex items-center gap-2">
                   <Clock className="h-3 w-3 text-slate-400" />
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                     Última hace {formatDistanceToNow(new Date(pendingRequests[0].createdAt || new Date()), { locale: es })}
                   </p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex flex-col gap-2">
               {pendingRequests.slice(0, 2).map((req) => (
                 <div key={req.id} className="flex items-center justify-between bg-white/50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">#{req.id}</span>
                    <span className="text-[9px] font-bold text-slate-400 truncate max-w-[120px] uppercase tracking-tighter">{req.solicitanteName}</span>
                 </div>
               ))}
            </div>
          </div>

          <Button 
            variant="default" 
            className="w-full h-10 bg-black hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest group-hover:shadow-lg transition-all"
            onClick={onAction}
          >
            Procesar Solicitudes <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
