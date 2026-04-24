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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  CheckCircle, 
  XCircle, 
  FileCog, 
  FileText,
  Bot, 
  ChevronDown, 
  Loader2, 
  Sparkles, 
  Download, 
  Eye,
  Filter,
  AlertCircle,
  Heart,
  Copy
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { GenerateOCDialog } from '@/components/app/generate-oc-dialog';
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
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const statusStyles: { [key: string]: string } = {
  pendiente: 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm font-bold',
  vigente: 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm font-bold',
  aprobada: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm font-bold',
  rechazada: 'bg-red-50 text-red-600 border-red-100 opacity-80',
  procesada: 'bg-slate-900 text-white font-black border-slate-900',
  completado: 'bg-slate-900 text-white font-black border-slate-900',
};

const getDisplayStatus = (status: string | undefined) => {
  const s = status?.toLowerCase().trim() || 'pendiente';
  if (s === 'vigente' || s === 'pendiente') return 'PENDIENTE';
  if (s === 'procesada' || s === 'completado') return 'COMPLETADO';
  return s.toUpperCase();
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});




function RequestRow({ solicitud }: { solicitud: Solicitud }) {
  const { currentUser, updateSolicitud, toggleFavorite, addSolicitud, proveedores } = useAppContext();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const router = useRouter();
  
  // Prepare valid items for display
  const validItems = React.useMemo(() => {
    const rawItems = Array.isArray(solicitud.items) ? solicitud.items : [];
    return rawItems.filter(item => 
      item && item.name && String(item.name).trim() !== '' && String(item.name).toLowerCase() !== 'null'
    );
  }, [solicitud.items]);

  const [showConfirm, setShowConfirm] = React.useState<'aprobada' | 'rechazada' | null>(null);
  const [showGenerateOC, setShowGenerateOC] = React.useState(false);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleStatusChange = (status: 'aprobada' | 'rechazada') => {
    if (solicitud.id) {
      updateSolicitud(solicitud.id, { status });
    }
    setShowConfirm(null);
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
          {currencyFormatter.format(solicitud.totalEstimatedCost || 0)}
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
              <>
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
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-10 w-10 p-0 rounded-xl border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-primary shadow-sm transition-all duration-300"
                  title="Duplicar requisición"
                  onClick={handleDuplicate}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </>
            )}

            <Button 
              variant="outline" 
              size="sm" 
              className="h-10 rounded-xl border-slate-200 text-slate-500 hover:bg-slate-50 font-black text-[10px] px-4 shadow-sm transition-all tracking-widest uppercase"
              onClick={() => {
                const proveedorObj = proveedores.find(p => p.name === solicitud.proveedor);
                import('@/lib/pdf-generator').then(({ generateRequisitionPDF }) => {
                  generateRequisitionPDF(solicitud as any, proveedorObj as any);
                });
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>

            {((currentUser?.role?.toLowerCase() || '') === 'compras' || (currentUser?.role?.toLowerCase() || '') === 'comprador' || (currentUser?.role?.toLowerCase() || '') === 'admin') && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100 transition-all">
                    <MoreHorizontal className="h-4 w-4 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border-slate-200 bg-white text-slate-900 shadow-premium p-2 rounded-2xl">
                  {solicitud.status === 'vigente' && (
                    <>
                      <DropdownMenuItem onSelect={() => setShowConfirm('aprobada')} className="cursor-pointer rounded-xl font-black py-3 text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:text-primary transition-colors">
                        <CheckCircle className="mr-3 h-4 w-4 text-accent" /> Aprobar
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setShowConfirm('rechazada')} className="cursor-pointer text-red-600 focus:text-red-600 rounded-xl font-black py-3 text-[10px] uppercase tracking-widest hover:bg-red-50 transition-colors">
                        <XCircle className="mr-3 h-4 w-4" /> Rechazar
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setShowGenerateOC(true)} className="cursor-pointer rounded-xl font-black py-3 text-[10px] uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-colors">
                        <FileText className="mr-3 h-4 w-4" /> Generar OC
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow className="bg-slate-50/30 hover:bg-slate-50/30 border-t-0">
          <TableCell colSpan={8} className="p-0">
            <div className="p-6 border-b border-slate-100 shadow-inner">
              {validItems.length > 0 ? (
                <>
                  <h4 className="font-bold mb-2 text-black uppercase tracking-wider text-xs">Detalles de la Requisición</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {validItems.map(item => {
                      const safeName = typeof item.name === 'string' ? item.name : 'Producto sin nombre';
                      const safeCost = Number(item.estimatedCost) || 0;
                      const safeQty = Number(item.quantity) || 0;

                      return (
                        <li key={item.id} className="flex justify-between items-center py-1">
                          <div className="flex flex-col">
                            <span>{safeQty} x {safeName}</span>
                            {item.codigoMaterial && <span className="text-[10px] opacity-70">Código: {item.codigoMaterial}</span>}
                          </div>
                          <div className="text-right">
                            <span className="block font-medium">{currencyFormatter.format(item.montoTotalIva || (safeCost * safeQty * 1.19))} <span className="text-[10px] text-slate-400">(IVA inc.)</span></span>
                            <span className="block text-[10px] text-slate-400">Neto: {currencyFormatter.format(item.montoNeto || (safeCost * safeQty))}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  
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
      <AlertDialog open={!!showConfirm} onOpenChange={() => setShowConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción cambiará el estado de la requisición a '{showConfirm}'. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleStatusChange(showConfirm!)}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <GenerateOCDialog 
        solicitud={solicitud}
        open={showGenerateOC}
        onOpenChange={setShowGenerateOC}
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

      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-mango">
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
