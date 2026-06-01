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
import { useAppContext } from '@/context/app-context';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { FileDown, Edit } from 'lucide-react';
import { generateOrderPDF } from '@/lib/order-pdf-generator';
import { cn } from '@/lib/utils';
import { EditOrderDialog } from './comex/edit-order-dialog';

export function OrdersTable() {
  const { ordenesCompra, currentUser, proveedores } = useAppContext();
  const [editingOrder, setEditingOrder] = React.useState<any | null>(null);

  const sortedOrders = React.useMemo(() => {
    return [...ordenesCompra].sort((a, b) => parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime());
  }, [ordenesCompra]);

  function formatCurrency(value: number, currency: string = 'CLP') {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency === 'UF' ? 'CLP' : (currency || 'CLP'),
    }).format(value) + (currency === 'UF' ? ' UF' : '');
  }

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'completado' || s === 'procesada') return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
    if (s === 'generado') return 'bg-blue-500/10 text-blue-600 border-blue-200';
    if (s === 'cancelado') return 'bg-red-500/10 text-red-600 border-red-200';
    return 'bg-slate-500/10 text-slate-600 border-slate-200';
  };

  const handlePrint = async (order: any) => {
    // Map to the format expected by generateOrderPDF
    const items = typeof order.Items_JSON === 'string' ? JSON.parse(order.Items_JSON) : (order.Items_JSON || []);
    
    const orderToPrint = {
      ...order,
      id: order["N° Orden"] || order.id || '',
      solicitudId: order["Requisición"] || order.solicitudId || '',
      createdAt: order["Fecha"] || order.createdAt || new Date().toISOString(),
      supplierName: order["Proveedor"] || order.supplierName || '',
      totalNeto: order["Total_Neto"] || order.totalNeto || 0,
      totalIva: order["Total_IVA"] || order.totalIva || 0,
      totalGlobal: order["Total_Global"] || order.totalGlobal || 0,
      moneda: order["Moneda"] || order.moneda || 'CLP',
      centroCostos: order["CECO"] || order.centroCostos || '',
      centroNegocios: order["CENE"] || order.centroNegocios || '',
      observaciones: order["Observaciones"] || order.observaciones || order.poDescription || '',
      formaPago: order["Forma de Pago"] || order.formaPago || '',
      referencia: order["Ref"] || order.referencia || '',
      razonSocial: order["RAZON SOCIAL"] || order.razonSocial || '',
      rut: order["RUT"] || order.rut || '',
      direccion: order["DIRECCION"] || order.direccion || '',
      ciudad: order["CIUDAD"] || order.ciudad || '',
      pais: order["PAÌS"] || order.pais || '',
      email: order["EMAIL"] || order.email || '',
      telefono: order["TELEFONO"] || order.telefono || '',
      items: items.map((it: any) => ({
        id: it.id || '',
        name: it.descripcion || it.name || '',
        quantity: parseFloat(it.unidades || it.quantity) || 0,
        unitCost: parseFloat(it.precio_unitario || it.unitCost) || 0,
        montoNeto: parseFloat(it.monto_neto || it.montoNeto || ((parseFloat(it.unidades || it.quantity) || 0) * (parseFloat(it.precio_unitario || it.unitCost) || 0))) || 0,
        codigoMaterial: it.codigo_material || it.codigoMaterial || '',
        cuentaPresupuesto: it.cuentaPresupuesto || it.cuenta_presupuesto || it["Cuentas Presupuesto"] || ''
      }))
    };
    await generateOrderPDF(orderToPrint as any, proveedores);
  };

  return (
    <>
    <Table>
      <TableHeader>
        <TableRow className="bg-slate-50/50">
          <TableHead className="font-black text-[10px] uppercase tracking-wider">ID de OC</TableHead>
          <TableHead className="font-black text-[10px] uppercase tracking-wider">Ref. Solicitud</TableHead>
          <TableHead className="font-black text-[10px] uppercase tracking-wider">Fecha</TableHead>
          <TableHead className="font-black text-[10px] uppercase tracking-wider">Proveedor</TableHead>
          <TableHead className="font-black text-[10px] uppercase tracking-wider">Estado</TableHead>
          <TableHead className="font-black text-[10px] uppercase tracking-wider text-right">Costo Total</TableHead>
          <TableHead className="font-black text-[10px] uppercase tracking-wider text-center">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedOrders.map((order) => (
          <TableRow key={order.id} className="hover:bg-slate-50/30 transition-colors">
            <TableCell className="font-black text-slate-900">{order.id.toUpperCase()}</TableCell>
            <TableCell className="font-medium text-slate-500">{order.solicitudId.toUpperCase()}</TableCell>
            <TableCell className="text-slate-600 font-medium">
              {(() => {
                try {
                  return format(parseISO(order.createdAt), "dd MMM yyyy", { locale: es });
                } catch (e) {
                  return order.createdAt || 'Sin fecha';
                }
              })()}
            </TableCell>
            <TableCell className="font-bold text-slate-700">{order.supplierName}</TableCell>
            <TableCell>
              <Badge variant="outline" className={cn("text-[9px] font-black uppercase rounded-sm px-2 py-0.5", getStatusColor(order.status || 'generado'))}>
                {order.status || 'generado'}
              </Badge>
            </TableCell>
            <TableCell className="text-right font-black text-slate-900">
              {formatCurrency(order.totalGlobal || order.totalCost || 0, order.moneda)}
            </TableCell>
            <TableCell className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-sm"
                    onClick={() => setEditingOrder(order)}
                    title="Editar Orden"
                >
                    <Edit className="h-4 w-4" />
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-sm"
                    onClick={() => handlePrint(order)}
                    title="Imprimir PDF"
                >
                    <FileDown className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    
    <EditOrderDialog 
      open={!!editingOrder} 
      onOpenChange={(open) => !open && setEditingOrder(null)} 
      order={editingOrder}
      onOrderUpdated={(updated) => {
        // Typically handled by AppContext state updating from db
      }}
    />
    </>
  );
}
