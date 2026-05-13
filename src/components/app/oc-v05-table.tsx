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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Search, 
  Loader2, 
  AlertCircle,
  LayoutDashboard,
  FileText,
  Calendar,
  Building2,
  Package,
  MoreVertical,
  Printer
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export function OCV05Table() {
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: results, error: fetchError } = await supabase
        .from('OrdenesCompraV05')
        .select('*')
        .order('id', { ascending: false });

      if (fetchError) throw fetchError;
      setData(results || []);
    } catch (err: any) {
      console.error('Error fetching OC V05 data:', err);
      setError(err.message || 'Error al cargar los registros de OC V05.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = React.useMemo(() => {
    if (!searchQuery) return data;
    const query = searchQuery.toLowerCase();
    return data.filter(item => 
      String(item["N° Orden"] || '').toLowerCase().includes(query) ||
      String(item["Proveedor"] || '').toLowerCase().includes(query) ||
      String(item["Requisición"] || '').toLowerCase().includes(query)
    );
  }, [data, searchQuery]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p>Cargando órdenes V05...</p>
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
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por N°, Proveedor o Req..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-white/50 border-slate-200 focus-visible:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredData.length === 0 ? (
          <div className="col-span-full h-32 flex items-center justify-center text-slate-500 border-2 border-dashed rounded-xl">
            No se encontraron órdenes V05.
          </div>
        ) : (
          filteredData.map((item, idx) => {
            const items = typeof item.Items_JSON === 'string' ? JSON.parse(item.Items_JSON) : (item.Items_JSON || []);
            return (
              <Card key={item.id || idx} className="group hover:shadow-md transition-all border-slate-200 overflow-hidden">
                <CardHeader className="p-4 pb-2 bg-slate-50/50 flex flex-row items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none font-bold">
                        {item["N° Orden"]}
                      </Badge>
                      <Badge variant="outline" className="capitalize text-[10px] bg-white">
                        {item["Estatus"] || "Completado"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <Calendar className="h-3 w-3" />
                      {item["Fecha"] ? format(new Date(item["Fecha"]), 'PPP', { locale: es }) : 'Sin fecha'}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-slate-400">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="gap-2">
                        <FileText className="h-4 w-4" /> Ver Detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-primary">
                        <Printer className="h-4 w-4" /> Imprimir OC
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      <span className="font-bold text-slate-900 text-sm">{item["Proveedor"]}</span>
                    </div>
                    {item["Requisición"] && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <FileText className="h-3 w-3" />
                        Ref Req: {item["Requisición"]}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 border-t pt-2 mt-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Package className="h-3 w-3" /> {items.length} ítems</span>
                      <span>Total Neto</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono">{item["Moneda"] || 'CLP'}</span>
                      <span className="text-lg font-black text-slate-900">
                        {currencyFormatter.format(item["Total_Global"] || 0)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {items.slice(0, 3).map((it: any, i: number) => (
                      <div key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full truncate max-w-[100px]">
                        {it.descripcion}
                      </div>
                    ))}
                    {items.length > 3 && (
                      <div className="text-[10px] bg-slate-50 text-slate-400 px-2 py-0.5 rounded-full">
                        +{items.length - 3} más
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
      
      <div className="flex items-center gap-2 text-xs text-slate-400 mt-2 px-2">
        <LayoutDashboard className="h-3 w-3" />
        <span>Viendo datos de la versión optimizada V05 (Modelo JSONB)</span>
      </div>
    </div>
  );
}
