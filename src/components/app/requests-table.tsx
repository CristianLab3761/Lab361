'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal, 
  FileCog, 
  FileText,
  Bot, 
  ChevronDown, 
  Loader2, 
  Sparkles, 
  Download, 
  Eye,
  Filter,
  Heart,
  Copy,
  Printer,
  AlertCircle,
  Truck,
  Pencil
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { GenerateOCDialog } from '@/components/app/generate-oc-dialog';
import { NewRequestDialog } from '@/components/app/new-request-dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useAppContext } from '@/context/app-context';
import type { Solicitud } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { generateOrderPDF } from '@/lib/order-pdf-generator';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const statusStyles: { [key: string]: string } = {
  pendiente: 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm font-bold',
  vigente: 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm font-bold',
  aprobada: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm font-bold',
  rechazada: 'bg-red-50 text-red-600 border-red-100 opacity-80',
  procesada: 'bg-slate-900 text-white font-black border-slate-900',
  completado: 'bg-slate-900 text-white font-black border-slate-900',
  'oc creada': 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm font-bold',
};

const getDisplayStatus = (status: string | undefined) => {
  const s = status?.toLowerCase().trim() || 'pendiente';
  if (s === 'vigente' || s === 'pendiente') return 'PENDIENTE';
  if (s === 'procesada' || s === 'completado') return 'COMPLETADO';
  if (s === 'oc creada') return 'OC CREADA';
  return s.toUpperCase();
};

function formatCurrency(value: number, currency: string = 'CLP') {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: currency === 'UF' ? 'CLP' : (currency || 'CLP'),
    minimumFractionDigits: currency === 'CLP' ? 0 : 2,
  }).format(value) + (currency === 'UF' ? ' UF' : '');
}




function RequestRow({ solicitud }: { solicitud: Solicitud }) {
  const { currentUser, toggleFavorite, addSolicitud, proveedores, ordenesCompra } = useAppContext();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const router = useRouter();
  
  // Prepare valid items for display
  const validItems = React.useMemo(() => {
    const rawItems = Array.isArray(solicitud.items) ? solicitud.items : [];
    return rawItems.filter(item => 
      item && item.name && String(item.name).trim() !== '' && String(item.name).toLowerCase() !== 'null'
    );
  }, [solicitud.items]);

  const [showGenerateOC, setShowGenerateOC] = React.useState(false);
  const [showEditDialog, setShowEditDialog] = React.useState(false);

  // Check if this solicitud has an OC linked
  const hasOC = !!(solicitud["Ref OC"] || solicitud.status?.toLowerCase() === 'oc creada');

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };


  
  const handleDuplicate = () => {
    // Duplicate items without their historical IDs
    const duplicatedItems = (solicitud.items || []).map(item => ({
      ...item,
      id: `item-${Math.random().toString(36).substr(2, 9)}`
    }));

    // Destructure to omit properties that addSolicitud doesn't accept
    const { id, createdAt, solicitanteId, solicitanteName, ...rest } = solicitud;

    addSolicitud({
      ...rest,
      items: duplicatedItems,
      status: 'vigente',
      isFavorite: false
    });
  };

  const handleToggleFavorite = () => {
    if (solicitud.id) {
      toggleFavorite(solicitud.id, !!solicitud.isFavorite);
    }
  };

  return (
    <>
      <TableRow className="bg-white hover:bg-slate-50/50 transition-all duration-300 group border-b border-slate-100">
        <TableCell className="w-12">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl hover:bg-slate-100 transition-transform active:scale-95"
            onClick={handleToggleExpand}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
          </Button>
        </TableCell>
        <TableCell className="font-bold text-slate-900 tracking-tight text-sm uppercase">{solicitud.id?.toUpperCase()}</TableCell>
        <TableCell className="font-semibold text-slate-500 text-[10px] tracking-wider uppercase">
          {solicitud.createdAt ? format(parseISO(solicitud.createdAt), 'dd MMM yyyy', { locale: es }) : '---'}
        </TableCell>
        <TableCell className="font-bold text-slate-700 uppercase tracking-tight">{solicitud.solicitanteName || '---'}</TableCell>
        <TableCell className="max-w-[200px] truncate text-slate-400 font-semibold tracking-wide">{solicitud.proveedor || 'No especificado'}</TableCell>
        <TableCell className="font-bold text-primary text-lg tracking-tight">
          {formatCurrency(solicitud.totalEstimatedCost || 0, solicitud.moneda || (solicitud as any).Moneda)}
        </TableCell>
        <TableCell>
          <Badge className={cn("text-[10px] px-3 py-1 rounded-full uppercase tracking-widest border whitespace-nowrap", statusStyles[solicitud.status?.toLowerCase() || 'pendiente'])}>
            {getDisplayStatus(solicitud.status)}
          </Badge>
        </TableCell>
        <TableCell className="text-right px-4">
          <div className="flex items-center justify-end gap-3 pr-2">
            <Button 
                variant="outline" 
                size="sm" 
                className="h-10 w-10 p-0 rounded-xl border-slate-200 text-slate-400 hover:bg-primary hover:text-white hover:border-primary shadow-sm transition-all duration-300"
                title="Ver detalle"
                onClick={() => router.push(`/dashboard/solicitudes/${solicitud.id}`)}
              >
                <Eye className="h-4 w-4" />
            </Button>
            
            {((currentUser?.role?.toLowerCase() || '') === 'solicitante') && (
              <Button 
                variant="outline" 
                size="sm" 
                className={cn(
                  "h-10 w-10 p-0 rounded-xl border-slate-200 shadow-sm transition-all duration-300",
                  solicitud.isFavorite ? "text-red-500 bg-red-50 border-red-200 hover:bg-red-100" : "text-slate-400 hover:text-red-500 hover:bg-red-50"
                )}
                title={solicitud.isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
                onClick={handleToggleFavorite}
              >
                <Heart className={cn("h-4 w-4", solicitud.isFavorite && "fill-current")} />
              </Button>
            )}
 
            <Button 
              variant="outline" 
              size="sm" 
              className="h-10 rounded-xl border-slate-200 text-slate-500 hover:bg-slate-50 font-black text-[10px] px-4 shadow-sm transition-all tracking-widest uppercase"
              onClick={() => {
                import('@/lib/pdf-generator').then(({ generateRequisitionPDF }) => {
                  const doc = generateRequisitionPDF(solicitud as any);
                  doc.save(`Requisicion_${solicitud.solicitudId || solicitud.id || 'NUEVA'}.pdf`);
                });
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>
 
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100 transition-all">
                  <MoreHorizontal className="h-4 w-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-slate-200 bg-white text-slate-900 shadow-premium p-2 rounded-2xl">
                {/* Editar — solo Solicitante y si NO tiene OC */}
                {((currentUser?.role?.toLowerCase() || '') === 'solicitante') && !hasOC && (
                  <DropdownMenuItem 
                    onSelect={(e) => { e.preventDefault(); setTimeout(() => setShowEditDialog(true), 0); }} 
                    className="cursor-pointer rounded-xl font-black py-3 text-[10px] uppercase tracking-widest hover:bg-amber-50 hover:text-amber-700 transition-colors"
                  >
                    <Pencil className="mr-3 h-4 w-4" /> Editar
                  </DropdownMenuItem>
                )}

                {/* Generar OC */}
                <DropdownMenuItem 
                  onSelect={(e) => { e.preventDefault(); setTimeout(() => setShowGenerateOC(true), 0); }} 
                  className="cursor-pointer rounded-xl font-black py-3 text-[10px] uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  <FileText className="mr-3 h-4 w-4" /> Generar OC
                </DropdownMenuItem>

                {/* Duplicar Solicitud */}
                <DropdownMenuItem 
                  onSelect={handleDuplicate} 
                  className="cursor-pointer rounded-xl font-black py-3 text-[10px] uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  <Copy className="mr-3 h-4 w-4" /> Duplicar Solicitud
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow className="bg-slate-50/30 hover:bg-slate-50/30 border-t-0">
          <TableCell colSpan={8} className="p-0">
            <div className="p-6 border-b border-slate-100 shadow-inner">
              {validItems.length > 0 ? (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-black uppercase tracking-wider text-xs">Detalles de la Requisición</h4>
                    {solicitud["Ref OC"] && (() => {
                      const linkedOC = ordenesCompra.find(o => o.id === solicitud["Ref OC"]);
                      return (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[9px] font-black uppercase px-2 py-1 rounded-lg tracking-widest shadow-sm">
                            Vinculada a {solicitud["Ref OC"]}
                          </Badge>
                          {linkedOC && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 px-2 text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 gap-1.5"
                              onClick={() => generateOrderPDF(linkedOC)}
                            >
                              <Printer className="h-3 w-3" /> Descargar OC
                            </Button>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {validItems.map(item => {
                      const safeName = typeof item.name === 'string' ? item.name : 'Producto sin nombre';
                      const safeCost = Number(item.estimatedCost) || 0;
                      const safeQty = Number(item.quantity) || 0;
                      const reqCurrency = solicitud.moneda || (solicitud as any).Moneda;
 
                      return (
                        <li key={item.id} className="flex justify-between items-center py-1">
                          <div className="flex flex-col">
                            <span>{safeQty} x {safeName}</span>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                              {item.codigoMaterial && <span className="text-[10px] opacity-70">Código: {item.codigoMaterial}</span>}
                              {item.cuentaPresupuesto && (
                                <>
                                  {item.codigoMaterial && <span className="text-[10px] text-slate-300">|</span>}
                                  <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded text-[8px] font-bold border border-indigo-100">PPTO: {item.cuentaPresupuesto}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="block font-medium">{formatCurrency(item.montoTotalIva || (safeCost * safeQty * 1.19), reqCurrency)} <span className="text-[10px] text-slate-400">(IVA inc.)</span></span>
                            <span className="block text-[10px] text-slate-400">Neto: {formatCurrency(item.montoNeto || (safeCost * safeQty), reqCurrency)}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  
                  {solicitud.fechaEntrega && (
                    <div className="mt-3 mb-2 text-xs flex items-center gap-2 text-slate-600 bg-slate-100/50 p-2 rounded-md border border-slate-200/60 w-fit">
                      <Truck className="h-3.5 w-3.5 text-primary" />
                      <span className="font-bold uppercase text-[9px] text-slate-400 tracking-wider">Fecha Deseada de Entrega:</span>
                      <span className="font-semibold text-slate-700">
                        {(() => {
                          try {
                            return format(parseISO(solicitud.fechaEntrega), 'dd/MM/yyyy');
                          } catch (e) {
                            return solicitud.fechaEntrega;
                          }
                        })()}
                      </span>
                    </div>
                  )}

                  {solicitud.comments && (
                    <div className="mt-2 text-sm">
                        <h5 className="font-semibold">Comentarios del solicitante:</h5>
                        <p className="text-muted-foreground p-2 bg-muted/50 rounded-md">{solicitud.comments}</p>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 italic">
                      Haz clic en el botón <Eye className="inline h-3 w-3" /> para ver el análisis detallado y acciones avanzadas.
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <AlertCircle className="h-10 w-10 text-slate-300 mb-3" />
                  <h4 className="font-bold text-slate-900 mb-1">Requisición sin productos</h4>
                  <p className="text-sm text-slate-500 max-w-xs">
                    Esta requisición no contiene ítems válidos después del proceso de limpieza de datos.
                  </p>
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
      <GenerateOCDialog 
        solicitud={solicitud}
        open={showGenerateOC}
        onOpenChange={setShowGenerateOC}
      />

      <NewRequestDialog 
        solicitudToEdit={solicitud}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
    </>
  );
}

export function RequestsTable({ filterStatus: propStatus, solicitanteId }: { filterStatus?: Solicitud['status']; solicitanteId?: string }) {
  const { solicitudes, currentUser } = useAppContext();
  
  const [searchTerm, setSearchTerm] = React.useState('');
  const [localFilterStatus, setLocalFilterStatus] = React.useState<string>(propStatus || 'all');
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  const filteredSolicitudes = React.useMemo(() => {
    let items = [...solicitudes];
    
    if (localFilterStatus !== 'all') {
      const targetStatus = localFilterStatus.toLowerCase().trim();
      if (targetStatus === 'favoritos') {
        items = items.filter(s => s.isFavorite);
      } else {
        items = items.filter(s => (s.status?.toLowerCase().trim() || 'vigente') === targetStatus);
      }
    } else if (propStatus) {
      const targetStatus = propStatus.toLowerCase().trim();
      items = items.filter(s => (s.status?.toLowerCase().trim() || 'vigente') === targetStatus);
    }

    if (solicitanteId) {
      items = items.filter(s => s.solicitanteId === solicitanteId);
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      items = items.filter(s => 
        (s.id?.toLowerCase().includes(lowerSearch)) || 
        (s.solicitanteName?.toLowerCase().includes(lowerSearch))
      );
    }

    return items.sort((a, b) => {
      try {
        const parseDate = (dateStr: string | undefined) => {
          if (!dateStr) return 0;
          // Si es ISO (2026-04-23)
          if (dateStr.includes('-')) {
            const d = parseISO(dateStr);
            return isNaN(d.getTime()) ? 0 : d.getTime();
          }
          // Si es DD/MM/YYYY
          if (dateStr.includes('/')) {
            const [day, month, year] = dateStr.split('/').map(Number);
            return new Date(year, month - 1, day).getTime();
          }
          return 0;
        };

        const dateA = parseDate(a.createdAt || a.Fecha);
        const dateB = parseDate(b.createdAt || b.Fecha);
        return (dateB || 0) - (dateA || 0);
      } catch (e) {
        return 0;
      }
    });
  }, [solicitudes, propStatus, localFilterStatus, solicitanteId, searchTerm, currentUser]);

  const totalItems = filteredSolicitudes.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedSolicitudes = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSolicitudes.slice(start, start + pageSize);
  }, [filteredSolicitudes, currentPage, pageSize]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, localFilterStatus]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-0.5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Buscar por ID o Solicitante..." 
            className="pl-9 bg-white border-slate-200 focus-visible:ring-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {!propStatus && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <Select value={localFilterStatus} onValueChange={setLocalFilterStatus}>
              <SelectTrigger className="w-[180px] bg-white border-slate-200">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Ver Todos</SelectItem>
                <SelectItem value="favoritos">Favoritos ⭐</SelectItem>
                <SelectItem value="vigente">Pendientes</SelectItem>
                <SelectItem value="anulada">Anuladas</SelectItem>
                <SelectItem value="aprobada">Aprobadas</SelectItem>
                <SelectItem value="procesada">Completados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-brand">
        <Table>
          <TableHeader className="bg-slate-50/10">
            <TableRow className="border-slate-100">
              <TableHead className="w-12"></TableHead>
              <TableHead className="font-bold text-slate-400 uppercase text-[11px] tracking-wider py-6">Requisición</TableHead>
              <TableHead className="font-bold text-slate-400 uppercase text-[11px] tracking-wider py-6">Fecha</TableHead>
              <TableHead className="font-bold text-slate-400 uppercase text-[11px] tracking-wider py-6">Solicitante</TableHead>
              <TableHead className="font-bold text-slate-400 uppercase text-[11px] tracking-wider py-6">Monto Total</TableHead>
              <TableHead className="font-bold text-slate-400 uppercase text-[11px] tracking-wider py-6">Estado</TableHead>
              <TableHead className="text-right px-6 font-bold text-slate-400 uppercase text-[11px] tracking-wider py-6">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSolicitudes.length > 0 ? (
              paginatedSolicitudes.map(solicitud => (
                <RequestRow key={solicitud.id} solicitud={solicitud} />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground font-medium italic opacity-60 bg-transparent">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="h-8 w-8 opacity-20" />
                    No se encontraron requisiciones que coincidan con los criterios.
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination UI */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4 border-t border-slate-100 mt-2">
          <div className="flex-1 text-sm text-slate-500">
            Mostrando <span className="font-medium text-black">{(currentPage - 1) * pageSize + 1}</span> a <span className="font-medium text-black">{Math.min(currentPage * pageSize, totalItems)}</span> de <span className="font-medium text-black">{totalItems}</span> requisiciones
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 border-slate-200 bg-white hover:bg-slate-50"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <div className="text-sm font-medium px-4">
              Pág. {currentPage} de {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-8 border-slate-200 bg-white hover:bg-slate-50"
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
