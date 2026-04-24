'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppContext } from '@/context/app-context';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Truck, 
  DollarSign, 
  FileText, 
  ChevronRight,
  Package,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const currencyFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
});

export default function SolicitudDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { solicitudes, updateSolicitud } = useAppContext();
  
  // Find the requisition
  // Note: AppContext id is a string, params id is a string. Ensure they match.
  const solicitud = solicitudes.find(s => String(s.id).toLowerCase() === String(id).toLowerCase());

  if (!solicitud) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Package className="h-12 w-12 text-slate-300" />
        <h2 className="text-xl font-semibold text-slate-900">Requisición no encontrada</h2>
        <p className="text-sm text-slate-500">ID solicitado: {id}</p>
        <Button onClick={() => router.push('/dashboard/solicitudes')} variant="outline">
          Volver a la lista
        </Button>
      </div>
    );
  }

  const validItems = (solicitud.items || []).filter(item => 
    item && item.name && String(item.name).trim() !== '' && String(item.name).toLowerCase() !== 'null'
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 p-4 md:p-6 lg:p-8">
      {/* Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-slate-100 h-10 w-10 shrink-0" 
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">Requisición</span>
              <Badge 
                variant={solicitud.status === 'anulada' ? 'destructive' : 'secondary'} 
                className="rounded-full text-[9px] font-bold h-5 px-3 border-0"
              >
                {(solicitud.status || 'VIGENTE').toUpperCase()}
              </Badge>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
              {(solicitud.id || 'N/A').toUpperCase()}
            </h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow border-[0.5px]">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Package className="h-4 w-4" /> 
                  Materiales Requeridos
                </CardTitle>
                <div className="text-[10px] font-bold text-slate-400">{validItems.length} materiales</div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {validItems.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {validItems.map((item, idx) => (
                    <div key={idx} className="p-5 hover:bg-slate-50/30 transition-colors flex items-center justify-between gap-4 group">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900 group-hover:text-black transition-colors">{item.name}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-[9px] font-bold border border-slate-200">ID MAT: {item.codigoMaterial || '---'}</span>
                          <span className="font-medium">{item.quantity} unidades</span>
                          <span className="text-slate-300">|</span>
                          <span className="font-medium">Unit: {currencyFormatter.format(item.estimatedCost)}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-black text-slate-900 text-base">
                          {currencyFormatter.format(item.quantity * item.estimatedCost)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
                  <AlertCircle className="h-10 w-10 text-slate-200" />
                  <p className="text-sm font-medium">No hay productos válidos en esta requisición.</p>
                </div>
              )}
              
              <div className="p-8 bg-slate-50/80 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Neto</span>
                  <span className="text-xl font-bold text-slate-700">
                    {currencyFormatter.format(solicitud.totalNeto || ((solicitud.totalEstimatedCost || 0) / 1.19))}
                  </span>
                </div>
                <div className="flex flex-col border-l border-slate-200 pl-6">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IVA (19%)</span>
                  <span className="text-xl font-bold text-slate-700">
                    {currencyFormatter.format(solicitud.totalIva || ((solicitud.totalEstimatedCost || 0) - ((solicitud.totalEstimatedCost || 0) / 1.19)))}
                  </span>
                </div>
                <div className="flex flex-col border-l border-slate-200 pl-6">
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Total Requisición</span>
                  <span className="text-3xl font-black text-black tracking-tight leading-none mt-1">
                    {currencyFormatter.format(solicitud.totalGlobal || solicitud.totalEstimatedCost || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {solicitud.comments && (
            <Card className="border-slate-200 shadow-sm border-[0.5px] bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-black uppercase text-slate-400 tracking-widest">Justificación del Requerimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <FileText className="absolute top-0 right-0 h-12 w-12 text-slate-50 opacity-10" />
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {solicitud.comments}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Metadata */}
        <div className="space-y-8">
          <Card className="border-slate-200 shadow-sm overflow-hidden border-[0.5px]">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Datos del Emisor</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-black group-hover:text-white transition-colors border border-slate-100">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fecha Emisión</p>
                  <p className="text-sm font-bold text-slate-900 leading-tight">
                    {solicitud.createdAt ? format(parseISO(solicitud.createdAt), 'PPPP', { locale: es }) : '---'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Solicitado por</p>
                  <p className="text-sm font-bold text-slate-900 leading-tight">
                    {solicitud.solicitanteName}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 mt-0.5">{solicitud.department || 'Sin área asignada'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Proveedor / Comercio</p>
                  <p className="text-sm font-bold text-slate-900 leading-tight italic">
                    {solicitud.proveedor || 'No especificado' }
                  </p>
                </div>
              </div>

              <Separator className="bg-slate-100" />
              
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col gap-1 items-center justify-center relative overflow-hidden">
                <DollarSign className="absolute -bottom-4 -right-4 h-24 w-24 text-slate-100 opacity-20 rotate-12" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10 text-center">TOTAL A PAGAR (IVA INC.)</span>
                <span className="text-2xl font-black text-black relative z-10 tracking-tight text-center">
                  {currencyFormatter.format(solicitud.totalGlobal || solicitud.totalEstimatedCost || 0)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
