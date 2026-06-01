'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { CostoCotizacion, EnvioComex } from '@/lib/comex';

export default function QuoteDialog({ 
  open, 
  onOpenChange, 
  onSuccess, 
  envio 
}: { 
  open: boolean, 
  onOpenChange: (open: boolean) => void, 
  onSuccess: () => void, 
  envio: EnvioComex 
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [forwarder, setForwarder] = useState('');
  const [incoterm, setIncoterm] = useState('FOB');
  const [transportMode, setTransportMode] = useState('FCL');
  const [transitTime, setTransitTime] = useState(0);
  const [route, setRoute] = useState('');
  const [costos, setCostos] = useState<CostoCotizacion[]>([]);

  const addCosto = () => {
    setCostos([...costos, { concepto: '', monto: 0, moneda: 'USD', aplicaIva: false, baseCobro: 'Plana' }]);
  };

  const updateCosto = (index: number, field: keyof CostoCotizacion, value: any) => {
    const newCostos = [...costos];
    newCostos[index] = { ...newCostos[index], [field]: value };
    setCostos(newCostos);
  };

  const removeCosto = (index: number) => {
    setCostos(costos.filter((_, i) => i !== index));
  };

  // Calcula el total en USD de esta cotización
  const calculateTotalUsd = () => {
    let total = 0;
    costos.forEach(c => {
      let amount = c.monto;
      
      if (c.baseCobro === 'Por M3') amount = amount * (envio.total_volume_m3 || 1);
      if (c.baseCobro === 'Por Kg') amount = amount * (envio.chargeable_weight_kg || 1);
      if (c.baseCobro === '% Valor') amount = (amount / 100) * (envio.merchandise_value_usd || 0);
      
      if (c.aplicaIva) {
        amount = amount * 1.16;
      }

      if (c.moneda === 'MXN') {
        amount = amount / (envio.exchange_rate || 1);
      }

      total += amount;
    });
    return total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forwarder) return;
    
    setLoading(true);
    const totalUsd = calculateTotalUsd();

    const { error } = await supabase.from('cotizaciones_comex').insert([{
      envio_id: envio.id,
      forwarder,
      incoterm,
      transport_mode: transportMode,
      transit_time_days: transitTime,
      route,
      costos_jsonb: costos,
      total_usd: totalUsd
    }]);

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Cotización Registrada', description: 'La cotización ha sido guardada exitosamente.' });
      onSuccess();
      onOpenChange(false);
      setForwarder(''); setCostos([]); setRoute(''); setTransitTime(0);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] p-6 rounded-3xl overflow-hidden bg-white shadow-premium border-slate-100 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Agregar Cotización</DialogTitle>
          <DialogDescription className="text-slate-500">
            Ingresa las tarifas para comparar. TC Aplicable: {envio.exchange_rate} MXN/USD.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Agencia / Forwarder</Label>
              <Input required value={forwarder} onChange={e => setForwarder(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>INCOTERM</Label>
              <Select value={incoterm} onValueChange={setIncoterm}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXW">EXW</SelectItem>
                  <SelectItem value="FCA">FCA</SelectItem>
                  <SelectItem value="FOB">FOB</SelectItem>
                  <SelectItem value="CIF">CIF</SelectItem>
                  <SelectItem value="DAP">DAP</SelectItem>
                  <SelectItem value="DDP">DDP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo Transporte</Label>
              <Select value={transportMode} onValueChange={setTransportMode}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FCL">Marítimo FCL</SelectItem>
                  <SelectItem value="LCL">Marítimo LCL</SelectItem>
                  <SelectItem value="Air">Aéreo</SelectItem>
                  <SelectItem value="Land">Terrestre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-3">
              <Label>Ruta</Label>
              <Input placeholder="Ej. Ningbo -> Manzanillo" value={route} onChange={e => setRoute(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>TT (Días)</Label>
              <Input type="number" min="0" value={transitTime || ''} onChange={e => setTransitTime(Number(e.target.value))} />
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-700">Desglose de Costos</h3>
              <Button type="button" variant="outline" size="sm" onClick={addCosto} className="gap-2 h-8">
                <Plus className="h-4 w-4" /> Agregar Línea
              </Button>
            </div>

            {costos.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-4 italic">No hay costos registrados.</p>
            ) : (
              <div className="space-y-3">
                {costos.map((c, i) => (
                  <div key={i} className="flex flex-wrap md:flex-nowrap items-end gap-2 bg-white p-2 border border-slate-100 rounded-lg shadow-sm">
                    <div className="flex-1 min-w-[150px] space-y-1">
                      <Label className="text-xs">Concepto</Label>
                      <Input className="h-8" value={c.concepto} onChange={e => updateCosto(i, 'concepto', e.target.value)} placeholder="Ej. Flete, Despacho..." />
                    </div>
                    <div className="w-24 space-y-1">
                      <Label className="text-xs">Base</Label>
                      <Select value={c.baseCobro} onValueChange={(val) => updateCosto(i, 'baseCobro', val)}>
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Plana">Plana</SelectItem>
                          <SelectItem value="Por M3">x M3</SelectItem>
                          <SelectItem value="Por Kg">x Kg</SelectItem>
                          <SelectItem value="Por BL">x BL</SelectItem>
                          <SelectItem value="% Valor">% Valor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24 space-y-1">
                      <Label className="text-xs">Monto</Label>
                      <Input className="h-8" type="number" step="0.01" value={c.monto || ''} onChange={e => updateCosto(i, 'monto', Number(e.target.value))} />
                    </div>
                    <div className="w-20 space-y-1">
                      <Label className="text-xs">Moneda</Label>
                      <Select value={c.moneda} onValueChange={(val) => updateCosto(i, 'moneda', val)}>
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="MXN">MXN</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-16 space-y-1 text-center">
                      <Label className="text-xs block mb-2">+ IVA</Label>
                      <Switch checked={c.aplicaIva} onCheckedChange={(val) => updateCosto(i, 'aplicaIva', val)} />
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => removeCosto(i)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {costos.length > 0 && (
              <div className="mt-4 text-right pt-4 border-t border-slate-200">
                <span className="text-sm font-bold text-slate-500 mr-2 uppercase tracking-wider">Costo Total Calculado:</span>
                <span className="text-2xl font-black text-primary">${calculateTotalUsd().toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</span>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar Cotización
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}