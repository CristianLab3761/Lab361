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
  Database
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { GenerateOCDialog } from '@/components/app/generate-oc-dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, FileText } from 'lucide-react';
import { Solicitud } from '@/lib/types';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export function V04Table() {
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedReq, setSelectedReq] = React.useState<any | null>(null);
  const [showGenerateOC, setShowGenerateOC] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: results, error: fetchError } = await supabase
        .from('RequisicionesV04')
        .select('*')
        .order('id', { ascending: false });

      if (fetchError) throw fetchError;
      setData(results || []);
    } catch (err: any) {
      console.error('Error fetching V04 data:', err);
      setError(err.message || 'Error al cargar los datos históricos.');
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
      String(item["N° Requisición"] || '').toLowerCase().includes(query) ||
      String(item["Solicitante"] || '').toLowerCase().includes(query) ||
      String(item["Proveedor"] || '').toLowerCase().includes(query)
    );
  }, [data, searchQuery]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p>Cargando registros históricos...</p>
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
            placeholder="Buscar por N°, Solicitante o Proveedor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-white/50 border-slate-200 focus-visible:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="w-[100px] font-semibold text-slate-700">N° Req</TableHead>
                  <TableHead className="font-semibold text-slate-700">Fecha</TableHead>
                  <TableHead className="font-semibold text-slate-700">Solicitante</TableHead>
                  <TableHead className="font-semibold text-slate-700">Proveedor</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Total</TableHead>
                  <TableHead className="w-[120px] text-center font-semibold text-slate-700">Estatus</TableHead>
                  <TableHead className="w-[80px] text-right font-semibold text-slate-700">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                      No se encontraron registros.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item, idx) => (
                    <TableRow key={item.id || idx} className="group hover:bg-slate-50/80 transition-colors border-slate-100">
                      <TableCell className="font-bold text-slate-900 whitespace-nowrap">
                        {item["N° Requisición"] || "—"}
                      </TableCell>
                      <TableCell className="text-slate-600 whitespace-nowrap">
                        {item["Fecha"] || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800">{item["Solicitante"] || "—"}</span>
                          <span className="text-xs text-slate-500">{item["Cargo"] || ""}</span>
                        </div>
                      </TableCell>

                      <TableCell className="text-slate-600 truncate max-w-[200px]">
                        {item["Proveedor"] || "No especificado"}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium text-slate-900">
                        {currencyFormatter.format(parseFloat(item["Total_Global"] || item.Total || 0))}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "capitalize font-medium text-[11px] px-2 py-0 h-5",
                            (item["Estatus"] || "vigente").toLowerCase() === 'vigente' 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                              : "bg-slate-50 text-slate-500 border-slate-200"
                          )}
                        >
                          {item["Estatus"] || "Vigente"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100">
                              <MoreHorizontal className="h-4 w-4 text-slate-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-premium border-slate-200">
                            <DropdownMenuItem 
                              onSelect={() => {
                                // Map V04 item to modern Solicitud type for the dialog
                                const mappedReq: Partial<Solicitud> = {
                                  id: item["N° Requisición"],
                                  proveedor: item["Proveedor"],
                                  totalEstimatedCost: parseFloat(item["Total_Global"] || item.Total || 0),
                                  items: [], // V04 items might be in a different table or not loaded here
                                  status: item["Estatus"]
                                };
                                setSelectedReq(mappedReq);
                                setShowGenerateOC(true);
                              }}
                              className="cursor-pointer rounded-lg font-bold text-xs py-2 hover:bg-slate-50 hover:text-primary"
                            >
                              <FileText className="mr-2 h-4 w-4" /> Generar OC
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <GenerateOCDialog 
        solicitud={selectedReq}
        open={showGenerateOC}
        onOpenChange={setShowGenerateOC}
      />
      
      <div className="flex items-center gap-2 text-xs text-slate-400 mt-2 px-2">
        <Database className="h-3 w-3" />
        <span>Viendo datos históricos de la versión V04</span>
      </div>
    </div>
  );
}
