'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function NewEnvioDialog({ open, onOpenChange, onSuccess }: { open: boolean, onOpenChange: (open: boolean) => void, onSuccess: () => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    reference: '',
    origin: '',
    destination: '',
    merchandise_value_usd: '',
    total_weight_kg: '',
    total_volume_m3: '',
    chargeable_weight_kg: '',
    exchange_rate: '1'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('envios_comex').insert([{
      reference: formData.reference,
      origin: formData.origin,
      destination: formData.destination,
      merchandise_value_usd: Number(formData.merchandise_value_usd) || 0,
      total_weight_kg: Number(formData.total_weight_kg) || 0,
      total_volume_m3: Number(formData.total_volume_m3) || 0,
      chargeable_weight_kg: Number(formData.chargeable_weight_kg) || 0,
      exchange_rate: Number(formData.exchange_rate) || 1,
      status: 'Pendiente'
    }]);

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Envío Creado', description: 'El envío se ha registrado exitosamente.' });
      onSuccess();
      onOpenChange(false);
      setFormData({
        reference: '',
        origin: '',
        destination: '',
        merchandise_value_usd: '',
        total_weight_kg: '',
        total_volume_m3: '',
        chargeable_weight_kg: '',
        exchange_rate: '1'
      });
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-6 rounded-3xl overflow-hidden bg-white shadow-premium border-slate-100">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Nuevo Envío (Comex)</DialogTitle>
          <DialogDescription className="text-slate-500">
            Ingresa los detalles principales de la carga y el tipo de cambio aplicable.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="reference">Referencia / Descripción</Label>
              <Input 
                id="reference" required 
                placeholder="Ej. Importación China Lote 4"
                value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="origin">Origen</Label>
              <Input 
                id="origin" placeholder="Ej. Shanghai, China"
                value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">Destino</Label>
              <Input 
                id="destination" placeholder="Ej. Manzanillo, México"
                value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="merchandise_value_usd">Valor Mercancía (USD)</Label>
              <Input 
                id="merchandise_value_usd" type="number" step="0.01" min="0" required
                value={formData.merchandise_value_usd} onChange={e => setFormData({...formData, merchandise_value_usd: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exchange_rate">Tipo de Cambio (MXN/USD)</Label>
              <Input 
                id="exchange_rate" type="number" step="0.0001" min="0" required
                value={formData.exchange_rate} onChange={e => setFormData({...formData, exchange_rate: e.target.value})}
              />
            </div>
            
            <div className="col-span-2 pt-2 pb-1"><Label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Dimensiones de Carga</Label></div>
            
            <div className="space-y-2">
              <Label htmlFor="total_weight_kg">Peso Total (Kg)</Label>
              <Input 
                id="total_weight_kg" type="number" step="0.01" min="0"
                value={formData.total_weight_kg} onChange={e => setFormData({...formData, total_weight_kg: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_volume_m3">Volumen Total (CBM / M3)</Label>
              <Input 
                id="total_volume_m3" type="number" step="0.01" min="0"
                value={formData.total_volume_m3} onChange={e => setFormData({...formData, total_volume_m3: e.target.value})}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="chargeable_weight_kg">Peso Cobrable (Kg)</Label>
              <Input 
                id="chargeable_weight_kg" type="number" step="0.01" min="0"
                value={formData.chargeable_weight_kg} onChange={e => setFormData({...formData, chargeable_weight_kg: e.target.value})}
              />
              <p className="text-[10px] text-slate-400">Normalmente el mayor entre el Peso Bruto y el Peso Volumétrico.</p>
            </div>
          </div>
          
          <DialogFooter className="border-t border-slate-100 pt-4 mt-6">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Crear Envío
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
