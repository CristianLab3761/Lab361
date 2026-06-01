'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/context/app-context';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface EditOrderDialogProps {
  order: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderUpdated?: (updatedOrder: any) => void;
}

export function EditOrderDialog({ order, open, onOpenChange, onOrderUpdated }: EditOrderDialogProps) {
  const { updateAdminItem } = useAppContext();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const [estatus, setEstatus] = React.useState(order?.['Estatus'] || order?.status || 'generado');
  const [formaPago, setFormaPago] = React.useState(order?.['Forma de Pago'] || order?.formaPago || '');
  const [ref, setRef] = React.useState(order?.['Ref'] || order?.referencia || '');
  const [observaciones, setObservaciones] = React.useState(order?.['Observaciones'] || order?.poDescription || order?.observaciones || '');

  React.useEffect(() => {
    if (order) {
      setEstatus(order['Estatus'] || order.status || 'generado');
      setFormaPago(order['Forma de Pago'] || order.formaPago || '');
      setRef(order['Ref'] || order.referencia || '');
      setObservaciones(order['Observaciones'] || order.poDescription || order.observaciones || '');
    }
  }, [order]);

  const handleSave = async () => {
    if (!observaciones.trim()) {
      toast({
        variant: 'destructive',
        title: 'Observación requerida',
        description: 'Debes agregar una observación de forma obligatoria para guardar los cambios.',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const updates = {
        Estatus: estatus,
        'Forma de Pago': formaPago,
        Ref: ref,
        Observaciones: observaciones,
        // Almacenar minúsculas para compatibilidad si la tabla lo espera
        estatus: estatus,
        formaPago: formaPago,
        poDescription: observaciones,
        observaciones: observaciones
      };

      // Si la tabla es V05
      await updateAdminItem('OrdenesCompraV05', order.id || order.db_id, updates);
      
      toast({
        title: 'Orden Actualizada',
        description: `Los datos de la orden han sido actualizados con éxito.`,
      });
      
      if (onOrderUpdated) {
        onOrderUpdated({ ...order, ...updates });
      }
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error al actualizar',
        description: error.message || 'Ha ocurrido un problema al guardar los cambios.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Orden de Compra</DialogTitle>
          <DialogDescription>
            Modifica los detalles de la orden {order['N° Orden'] || order.id}. Es obligatorio agregar una observación.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Estatus</Label>
            <Select value={estatus} onValueChange={setEstatus}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona estatus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="generado">Generado</SelectItem>
                <SelectItem value="completado">Completado</SelectItem>
                <SelectItem value="procesada">Procesada</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Forma de Pago</Label>
            <Input 
              placeholder="Ej: 30 Días" 
              value={formaPago} 
              onChange={e => setFormaPago(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label>Referencia (Ref)</Label>
            <Input 
              placeholder="Ej: REF-123" 
              value={ref} 
              onChange={e => setRef(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label>Observaciones <span className="text-red-500">*</span></Label>
            <Textarea 
              placeholder="Agrega una observación justificando la edición..." 
              value={observaciones} 
              onChange={e => setObservaciones(e.target.value)} 
              className={!observaciones.trim() ? "border-red-300" : ""}
            />
            {!observaciones.trim() && (
              <p className="text-[10px] text-red-500">Este campo es obligatorio.</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting || !observaciones.trim()}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
