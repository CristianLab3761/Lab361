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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  Loader2, 
  AlertCircle,
  Database,
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export function OCV04Table() {
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedOC, setSelectedOC] = React.useState<any | null>(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 15;

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: results, error: fetchError } = await supabase
        .from('OrdenesCompraV04')
        .select('*')
        .order('id', { ascending: false });

      if (fetchError) throw fetchError;
      setData(results || []);
    } catch (err: any) {
      console.error('Error fetching OC V04 data:', err);
      setError(err.message || 'Error al cargar los registros de OC V04.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return data;
    
    return data.filter(item => 
      String(item["ORDEN DE COMPRA"] || '').toLowerCase().includes(query) ||
      String(item["PROVEEDOR"] || '').toLowerCase().includes(query) ||
      String(item["REF"] || '').toLowerCase().includes(query) ||
      String(item["DESCRIPCION"] || '').toLowerCase().includes(query) ||
      String(item["RUT"] || '').toLowerCase().includes(query)
    );
  }, [data, searchQuery]);

  // Reset page when searching
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p>Cargando órdenes V04...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-rose-500 bg-rose-50 rounded-xl border border-rose-100 p-8">
        <AlertCircle className="h-10 w-10 text-rose-400" />
        <div className="text-center">
          <p className="font-semibold text-lg">Hubo un problema</p>
          <p className="text-sm opacity-80">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchData} className="mt-4">Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por OC, Proveedor, REF o RUT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-white/50 border-slate-200 focus-visible:ring-primary/20 transition-all"
          />
        </div>
        
        <div className="text-xs text-slate-500 font-medium">
          {filteredData.length} registros encontrados
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="w-[120px] font-semibold text-slate-700 uppercase text-[10px] tracking-wider">ORDEN</TableHead>
                  <TableHead className="w-[100px] font-semibold text-slate-700 uppercase text-[10px] tracking-wider">FECHA</TableHead>
                  <TableHead className="font-semibold text-slate-700 uppercase text-[10px] tracking-wider">PROVEEDOR</TableHead>
                  <TableHead className="font-semibold text-slate-700 uppercase text-[10px] tracking-wider">DESCRIPCION</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700 uppercase text-[10px] tracking-wider">TOTAL</TableHead>
                  <TableHead className="w-[100px] text-center font-semibold text-slate-700 uppercase text-[10px] tracking-wider">ESTATUS</TableHead>
                  <TableHead className="w-[80px] text-right font-semibold text-slate-700 uppercase text-[10px] tracking-wider">VER</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                      No se encontraron órdenes V04.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item, idx) => (
                    <TableRow key={item.id || idx} className="group hover:bg-slate-50/80 transition-colors border-slate-100">
                      <TableCell className="font-bold text-slate-900">
                        {item["ORDEN DE COMPRA"] || "—"}
                      </TableCell>
                      <TableCell className="text-slate-600 whitespace-nowrap text-xs">
                        {item["FECHA"] || "—"}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800">{item["PROVEEDOR"] || "—"}</span>
                          <span className="text-[10px] text-slate-400">{item["RUT"] || ""}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate text-slate-500 text-xs italic">
                        {item["DESCRIPCION"] || "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium text-slate-900">
                        {currencyFormatter.format(parseFloat(String(item["TOTAL"] || "0").replace(/\./g, '').replace(',', '.')))}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "capitalize font-medium text-[9px] px-2 py-0 h-5 border-none shadow-sm",
                            String(item["ESTATUS"] || "pendiente").toLowerCase() === 'pagado' || String(item["ESTATUS"] || "pendiente").toLowerCase() === 'recibido'
                              ? "bg-emerald-50 text-emerald-700" 
                              : "bg-slate-100 text-slate-500"
                          )}
                        >
                          {item["ESTATUS"] || "Pendiente"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setSelectedOC(item)}
                          className="h-8 w-8 text-slate-300 hover:text-primary hover:bg-primary/5 transition-all"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-xs text-slate-500">
            Mostrando <span className="font-bold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> de <span className="font-bold text-slate-900">{filteredData.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 px-3 gap-1 rounded-lg border-slate-200 text-xs font-bold"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum = currentPage;
                if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;
                
                if (pageNum <= 0 || pageNum > totalPages) return null;

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      "h-8 w-8 rounded-lg text-xs font-bold transition-all",
                      currentPage === pageNum ? "bg-black text-white shadow-lg" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="text-slate-400">...</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    className="h-8 w-8 rounded-lg text-xs font-bold border-slate-200 text-slate-600"
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-8 px-3 gap-1 rounded-lg border-slate-200 text-xs font-bold"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={!!selectedOC} onOpenChange={(open) => !open && setSelectedOC(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl rounded-2xl bg-white">
          <DialogHeader className="p-8 pb-4 bg-slate-50/50 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-2">
               <Badge className="bg-black text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">HISTORIAL V04</Badge>
               <span className="text-xs text-slate-400 font-bold tracking-widest uppercase">Metadata del Registro</span>
            </div>
            <DialogTitle className="flex items-center gap-3 text-3xl font-black text-slate-900 tracking-tighter">
              <Database className="h-8 w-8 text-primary" />
              ORDEN: {selectedOC?.["ORDEN DE COMPRA"]}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-sm">
              {selectedOC && Object.entries(selectedOC)
                .filter(([key]) => !['id', 'created_at', 's', 's_1', 's_2'].includes(key))
                .map(([key, value]) => (
                <div key={key} className="space-y-1.5 p-4 rounded-xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:shadow-sm hover:border-primary/20 transition-all group">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-primary transition-colors">{key}</p>
                  <p className="font-bold text-slate-800 break-words text-xs">{String(value || '—')}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="p-8 border-t bg-slate-50/50 flex justify-end gap-3">
            <Button variant="outline" className="rounded-xl font-bold uppercase text-[10px] tracking-widest" onClick={() => setSelectedOC(null)}>Cerrar</Button>
            <Button className="rounded-xl font-black uppercase text-[10px] tracking-widest bg-black hover:bg-slate-800 text-white px-8">Imprimir</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <div className="flex items-center gap-2 text-xs text-slate-400 mt-2 px-2 italic font-medium">
        <Database className="h-3 w-3" />
        <span>Viendo datos de la tabla plana OrdenesCompraV04 (36 columnas) • {data.length} registros totales</span>
      </div>
    </div>
  );
}
