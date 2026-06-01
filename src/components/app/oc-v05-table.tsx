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
  Printer,
  Edit
} from 'lucide-react';
import { EditOrderDialog } from './comex/edit-order-dialog';
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
import { generateOrderPDF } from '@/lib/order-pdf-generator';
import { useAppContext } from '@/context/app-context';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export function OCV05Table() {
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedOrder, setSelectedOrder] = React.useState<any | null>(null);
  const [editingOrder, setEditingOrder] = React.useState<any | null>(null);
  const { proveedores } = useAppContext();

  const handlePrint = async (order: any) => {
    // Map to the format expected by generateOrderPDF if necessary
    const items = typeof order.Items_JSON === 'string' ? JSON.parse(order.Items_JSON) : (order.Items_JSON || []);
    
    const orderToPrint = {
      id: order["N° Orden"] || order.id || '',
      solicitudId: order["Requisición"] || '',
      createdAt: order["Fecha"] || new Date().toISOString(),
      supplierName: order["Proveedor"] || '',
      totalNeto: order["Total_Neto"] || 0,
      totalIva: order["Total_IVA"] || 0,
      totalGlobal: order["Total_Global"] || 0,
      moneda: order["Moneda"] || 'CLP',
      centroCostos: order["CECO"] || order.centroCostos || '',
      centroNegocios: order["CENE"] || order.centroNegocios || '',
      items: items.map((it: any) => ({
        id: it.id || '',
        name: it.descripcion || it.name || '',
        quantity: parseFloat(it.unidades || it.quantity) || 0,
        unitCost: parseFloat(it.precio_unitario || it.unitCost) || 0,
        montoNeto: parseFloat(it.monto_neto || it.montoNeto || ((parseFloat(it.unidades || it.quantity) || 0) * (parseFloat(it.precio_unitario || it.unitCost) || 0))) || 0,
        codigoMaterial: it.codigo_material || it.codigoMaterial || '',
        cuentaPresupuesto: it.cuentaPresupuesto || it.cuenta_presupuesto || it["Cuentas Presupuesto"] || ''
      })),
      observaciones: order["Observaciones"] || '',
      formaPago: order["Forma de Pago"] || '',
      referencia: order["Ref"] || '',
      // Extra fields if available
      razonSocial: order["RAZON SOCIAL"] || '',
      rut: order["RUT"] || '',
      direccion: order["DIRECCION"] || '',
      ciudad: order["CIUDAD"] || '',
      pais: order["PAÌS"] || '',
      email: order["EMAIL"] || '',
      telefono: order["TELEFONO"] || ''
    };

    await generateOrderPDF(orderToPrint as any, proveedores);
  };

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
                      <DropdownMenuItem className="gap-2" onClick={() => setSelectedOrder(item)}>
                        <FileText className="h-4 w-4" /> Ver Detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2" onClick={() => setEditingOrder(item)}>
                        <Edit className="h-4 w-4" /> Editar OC
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-primary" onClick={() => handlePrint(item)}>
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

      {/* Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white border-none shadow-2xl">
          {selectedOrder && (
            <>
              <div className="bg-slate-900 text-white p-8">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                       <Badge className="bg-primary text-black font-black text-xs px-3 py-1 rounded-full border-none">
                         {selectedOrder["N° Orden"]}
                       </Badge>
                       <Badge variant="outline" className="border-slate-700 text-slate-300 uppercase text-[10px] tracking-widest font-black">
                         {selectedOrder["Estatus"] || "COMPLETADO"}
                       </Badge>
                    </div>
                    <DialogTitle className="text-3xl font-black tracking-tighter mt-2">ORDEN DE COMPRA</DialogTitle>
                    <DialogDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">
                      Emitida el {selectedOrder["Fecha"] ? format(new Date(selectedOrder["Fecha"]), 'PPP', { locale: es }) : 'Sin fecha'}
                    </DialogDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    className="border-slate-700 text-white hover:bg-slate-800 bg-transparent gap-2 font-black text-[10px] uppercase tracking-widest"
                    onClick={() => handlePrint(selectedOrder)}
                  >
                    <Printer className="h-4 w-4" /> Exportar PDF
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-2 gap-12">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-2">Información del Proveedor</h4>
                      <div className="space-y-3">
                         <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Razón Social</span>
                            <span className="font-black text-slate-900 uppercase tracking-tight">{selectedOrder["Proveedor"]}</span>
                         </div>
                         {selectedOrder["RAZON SOCIAL"] && (
                           <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Razón Social Legal</span>
                              <span className="text-sm font-bold text-slate-600">{selectedOrder["RAZON SOCIAL"]}</span>
                           </div>
                         )}
                         {selectedOrder["RUT"] && (
                           <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">RUT</span>
                              <span className="text-sm font-bold text-slate-600">{selectedOrder["RUT"]}</span>
                           </div>
                         )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-2">Detalles de la Transacción</h4>
                      <div className="space-y-3">
                         <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Requisición Origen</span>
                            <span className="font-black text-primary uppercase tracking-tight flex items-center gap-2">
                               <FileText className="h-3 w-3" /> {selectedOrder["Requisición"] || 'N/A'}
                            </span>
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Centro de Costos</span>
                            <span className="text-sm font-bold text-slate-600">{selectedOrder["CECO"] || 'N/A'}</span>
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Forma de Pago</span>
                            <span className="text-sm font-bold text-slate-600">{selectedOrder["Forma de Pago"] || 'N/A'}</span>
                         </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-slate-100" />

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Detalle de Productos</h4>
                    <div className="rounded-2xl border border-slate-100 overflow-hidden bg-slate-50/50">
                      <Table>
                        <TableHeader className="bg-slate-100/50">
                          <TableRow>
                            <TableHead className="text-[9px] font-black uppercase tracking-widest">Descripción</TableHead>
                            <TableHead className="text-[9px] font-black uppercase tracking-widest text-center">Cant.</TableHead>
                            <TableHead className="text-[9px] font-black uppercase tracking-widest text-right">Unitario</TableHead>
                            <TableHead className="text-[9px] font-black uppercase tracking-widest text-right">Subtotal</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(typeof selectedOrder.Items_JSON === 'string' ? JSON.parse(selectedOrder.Items_JSON) : (selectedOrder.Items_JSON || [])).map((item: any, i: number) => (
                            <TableRow key={i} className="border-slate-100 hover:bg-white">
                              <TableCell className="py-4">
                                <div className="flex flex-col">
                                   <span className="font-black text-slate-800 text-xs uppercase">{item.descripcion || item.name}</span>
                                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{item.codigo_material || item.codigoMaterial || 'SIN CÓDIGO'}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-center font-bold text-slate-600">{item.unidades || item.quantity}</TableCell>
                              <TableCell className="text-right font-bold text-slate-600">
                                {currencyFormatter.format(item.precio_unitario || item.unitCost || 0)}
                              </TableCell>
                              <TableCell className="text-right font-black text-slate-900">
                                {currencyFormatter.format(item.monto_neto || (item.quantity * item.unitCost) || 0)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <div className="w-72 bg-slate-900 text-white p-6 rounded-3xl space-y-3 shadow-2xl shadow-slate-900/30">
                       <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          <span>Neto</span>
                          <span>{currencyFormatter.format(selectedOrder["Total_Neto"] || 0)}</span>
                       </div>
                       <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          <span>IVA (19%)</span>
                          <span>{currencyFormatter.format(selectedOrder["Total_IVA"] || 0)}</span>
                       </div>
                       <Separator className="bg-slate-800" />
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Total Global</span>
                          <span className="text-2xl font-black tracking-tighter">
                            {currencyFormatter.format(selectedOrder["Total_Global"] || 0)}
                          </span>
                       </div>
                       <div className="text-[8px] font-black uppercase text-center text-slate-500 tracking-widest pt-2">
                          Valores expresados en {selectedOrder["Moneda"] || 'CLP'}
                       </div>
                    </div>
                  </div>

                  {selectedOrder["Observaciones"] && (
                    <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
                       <h5 className="text-[9px] font-black uppercase tracking-widest text-amber-600 mb-2">Observaciones</h5>
                       <p className="text-xs font-bold text-amber-900/70 leading-relaxed italic">{selectedOrder["Observaciones"]}</p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100">
                <Button variant="ghost" onClick={() => setSelectedOrder(null)} className="font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900">
                  Cerrar Ventana
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <EditOrderDialog 
        open={!!editingOrder} 
        onOpenChange={(open) => !open && setEditingOrder(null)} 
        order={editingOrder}
        onOrderUpdated={(updated) => {
          fetchData();
        }}
      />
    </div>
  );
}
