'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { OrdenCompraV04, Recepcion, ConciliacionRow } from '@/lib/types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Loader2, AlertTriangle, ChevronLeft, ChevronRight, ArrowDown, ArrowUp } from 'lucide-react';
import { format, differenceInDays, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export function ConciliacionTable() {
  const [data, setData] = useState<ConciliacionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [filterRetraso, setFilterRetraso] = useState('todos'); // 'todos' or 'retrasados'
  const [filterFecha, setFilterFecha] = useState('todos'); // 'todos', '7d', '15d', '30d', '90d'
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch both tables concurrently
        const [ordenesRes, recepcionesRes] = await Promise.all([
          supabase.from('OrdenesCompraV04').select('*').order('created_at', { ascending: false }).limit(1000),
          supabase.from('recepciones').select('*').order('timestamp', { ascending: false })
        ]);

        if (ordenesRes.error) throw ordenesRes.error;
        if (recepcionesRes.error) throw recepcionesRes.error;

        const ordenes = (ordenesRes.data as OrdenCompraV04[]) || [];
        const recepciones = (recepcionesRes.data as Recepcion[]) || [];

        // Map recepciones by orden_compra for quick lookup
        const recepcionesMap = new Map<string, Recepcion[]>();
        recepciones.forEach(r => {
          const oc = r.orden_compra;
          if (!oc) return;
          if (!recepcionesMap.has(oc)) {
            recepcionesMap.set(oc, []);
          }
          recepcionesMap.get(oc)?.push(r);
        });

        const rows: ConciliacionRow[] = [];
        const today = new Date();

        // Deduplicate Ordenes de Compra (they might have multiple rows for items)
        const uniqueOrdenes = Array.from(
          new Map(ordenes.map(oc => [oc['ORDEN DE COMPRA'], oc])).values()
        );

        // Process Ordenes de Compra
        uniqueOrdenes.forEach(oc => {
          const ocNumber = oc['ORDEN DE COMPRA'];
          if (!ocNumber) return;

          const recs = recepcionesMap.get(ocNumber);
          
          let ocDate = oc['FECHA'] ? parse(oc['FECHA'], 'dd-MM-yyyy', new Date()) : null;
          // Fallback if parsing fails or invalid
          if (!ocDate || isNaN(ocDate.getTime())) {
            ocDate = new Date(); 
          }

          if (recs && recs.length > 0) {
            // Recibido
            recs.forEach(rec => {
              const recDate = new Date(rec.timestamp);
              let delay = differenceInDays(recDate, ocDate!);
              // If received before or on the day, delay is 0
              if (delay < 0) delay = 0;

              rows.push({
                id: `oc-${ocNumber}-rec-${rec.id}`,
                ordenCompra: ocNumber,
                proveedor: oc['PROVEEDOR'] || rec.proveedor || '',
                fechaOC: oc['FECHA'],
                fechaRecepcion: format(recDate, 'dd-MM-yyyy', { locale: es }),
                diasEntrega: Number(oc['DÍAS ENTREGA']) || null,
                diasRetraso: delay,
                documentoRecepcion: rec.documento_recepcion || null,
                numeroDocumento: rec.numero_documento || null,
                estado: 'Recibido',
                recepcionesCount: recs.length
              });
            });
            // Remove from map to later find "Sin OC"
            recepcionesMap.delete(ocNumber);
          } else {
            // Pendiente
            const diasEntrega = Number(oc['DÍAS ENTREGA']) || 0;
            // Calculate delay based on today vs (ocDate + diasEntrega)
            const expectedDate = new Date(ocDate!.getTime() + diasEntrega * 24 * 60 * 60 * 1000);
            let delay = differenceInDays(today, expectedDate);
            if (delay < 0) delay = 0; // Not delayed yet

            rows.push({
              id: `oc-${ocNumber}-pend`,
              ordenCompra: ocNumber,
              proveedor: oc['PROVEEDOR'] || '',
              fechaOC: oc['FECHA'],
              fechaRecepcion: null,
              diasEntrega: diasEntrega,
              diasRetraso: delay,
              documentoRecepcion: null,
              numeroDocumento: null,
              estado: 'Pendiente'
            });
          }
        });

        // Process remaining recepciones (Sin OC Registrada)
        recepcionesMap.forEach((recs, ocNumber) => {
          recs.forEach(rec => {
            const recDate = new Date(rec.timestamp);
            rows.push({
              id: `rec-${rec.id}-sin-oc`,
              ordenCompra: ocNumber,
              proveedor: rec.proveedor || '',
              fechaOC: null,
              fechaRecepcion: format(recDate, 'dd-MM-yyyy', { locale: es }),
              diasEntrega: null,
              diasRetraso: null,
              documentoRecepcion: rec.documento_recepcion || null,
              numeroDocumento: rec.numero_documento || null,
              estado: 'Sin OC Registrada'
            });
          });
        });

        setData(rows);
      } catch (error) {
        console.error('Error fetching data for conciliacion:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const delayedCount = useMemo(() => {
    return data.filter(row => row.diasRetraso !== null && row.diasRetraso > 5).length;
  }, [data]);

  const filteredData = useMemo(() => {
    const result = data.filter(row => {
      const matchesSearch = row.ordenCompra.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (row.numeroDocumento && row.numeroDocumento.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesEstado = filterEstado === 'Todos' || row.estado === filterEstado;
      const matchesRetraso = filterRetraso === 'retrasados' ? (row.diasRetraso !== null && row.diasRetraso > 5) : true;
      
      let matchesFecha = true;
      if (filterFecha !== 'todos') {
        const ocDate = row.fechaOC ? parse(row.fechaOC, 'dd-MM-yyyy', new Date()) : null;
        if (ocDate && !isNaN(ocDate.getTime())) {
          const daysDiff = differenceInDays(new Date(), ocDate);
          if (filterFecha === '7d') matchesFecha = daysDiff <= 7;
          else if (filterFecha === '15d') matchesFecha = daysDiff <= 15;
          else if (filterFecha === '30d') matchesFecha = daysDiff <= 30;
          else if (filterFecha === '90d') matchesFecha = daysDiff <= 90;
        } else {
          matchesFecha = false;
        }
      }

      return matchesSearch && matchesEstado && matchesRetraso && matchesFecha;
    });

    result.sort((a, b) => {
      const dateA = a.fechaOC ? parse(a.fechaOC, 'dd-MM-yyyy', new Date()).getTime() : 0;
      const dateB = b.fechaOC ? parse(b.fechaOC, 'dd-MM-yyyy', new Date()).getTime() : 0;
      
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [data, searchTerm, filterEstado, filterRetraso, filterFecha, sortOrder]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterEstado, filterRetraso, filterFecha, sortOrder, pageSize]);

  const getStatusBadge = (estado: string, count?: number) => {
    switch (estado) {
      case 'Recibido':
        return (
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-0">Recibido</Badge>
            {count && count > 1 && (
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-bold rounded-full bg-slate-100 text-slate-600">
                x{count}
              </Badge>
            )}
          </div>
        );
      case 'Pendiente':
        return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-0">Pendiente</Badge>;
      case 'Sin OC Registrada':
        return <Badge className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-0">Sin OC Registrada</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const getDelayBadge = (dias: number | null) => {
    if (dias === null) return '-';
    if (dias === 0) return <span className="text-emerald-600 font-medium">A tiempo</span>;
    if (dias > 0 && dias <= 3) return <span className="text-amber-500 font-medium">{dias} días</span>;
    return <span className="text-rose-600 font-bold">{dias} días</span>;
  };

  return (
    <div className="space-y-4">
      {delayedCount > 0 && (
        <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Atención requerida</AlertTitle>
          <AlertDescription>
            Hay <strong>{delayedCount}</strong> {delayedCount === 1 ? 'envío' : 'envíos'} con más de 5 días de retraso.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por OC, proveedor o documento..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Select value={filterFecha} onValueChange={setFilterFecha}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Fecha OC" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Cualquier fecha</SelectItem>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="15d">Últimos 15 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterEstado} onValueChange={setFilterEstado}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos los estados</SelectItem>
              <SelectItem value="Recibido">Recibido</SelectItem>
              <SelectItem value="Pendiente">Pendiente</SelectItem>
              <SelectItem value="Sin OC Registrada">Sin OC Registrada</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterRetraso} onValueChange={setFilterRetraso}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filtro de retraso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los tiempos</SelectItem>
              <SelectItem value="retrasados">&gt; 5 días de retraso</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Orden de Compra</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                  className="-ml-4 h-8 font-medium hover:bg-accent/50"
                >
                  Fecha OC
                  {sortOrder === 'desc' ? <ArrowDown className="ml-2 h-4 w-4" /> : <ArrowUp className="ml-2 h-4 w-4" />}
                </Button>
              </TableHead>
              <TableHead>Fecha Recepción</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Retraso</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando datos...
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No se encontraron registros.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.ordenCompra}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={row.proveedor}>
                    {row.proveedor}
                  </TableCell>
                  <TableCell>{row.fechaOC || '-'}</TableCell>
                  <TableCell>{row.fechaRecepcion || '-'}</TableCell>
                  <TableCell>
                    {row.documentoRecepcion} {row.numeroDocumento && `#${row.numeroDocumento}`}
                  </TableCell>
                  <TableCell>{getStatusBadge(row.estado, (row as any).recepcionesCount)}</TableCell>
                  <TableCell className="text-right">
                    {getDelayBadge(row.diasRetraso)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          Mostrando {filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} a {Math.min(currentPage * pageSize, filteredData.length)} de {filteredData.length} registros
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Filas por página</p>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => {
                setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <span className="sr-only">Ir a la página anterior</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <span className="sr-only">Ir a la página siguiente</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
