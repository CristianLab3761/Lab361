'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  FileText, 
  Truck, 
  CreditCard, 
  Calendar as CalendarIcon,
  ShoppingBag,
  Plus,
  X,
  TrendingUp
} from 'lucide-react';
import { useAppContext } from '@/context/app-context';
import { Solicitud } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { SupplierAutocomplete } from '@/components/app/supplier-autocomplete';
import { ItemAutocomplete } from '@/components/app/item-autocomplete';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';

interface GenerateOCDialogProps {
  solicitud: Solicitud | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GenerateOCDialog({ solicitud, open, onOpenChange }: GenerateOCDialogProps) {
  const { addOrdenCompra, proveedores, materiales } = useAppContext();
  
  // Basic Info
  const [poNumber, setPoNumber] = React.useState('');
  const [referencia, setReferencia] = React.useState('');
  const [tipo, setTipo] = React.useState('Compra Directa');
  const [observaciones, setObservaciones] = React.useState('');
  
  // Supplier Details
  const [supplierName, setSupplierName] = React.useState('');
  const [razonSocial, setRazonSocial] = React.useState('');
  const [rut, setRut] = React.useState('');
  const [direccion, setDireccion] = React.useState('');
  const [ciudad, setCiudad] = React.useState('');
  const [pais, setPais] = React.useState('');
  const [telefono, setTelefono] = React.useState('');
  const [email, setEmail] = React.useState('');
  
  // Items State (Editable)
  const [items, setItems] = React.useState<any[]>([]);

  // Logistics & Financials
  const [deliveryDate, setDeliveryDate] = React.useState<Date>();
  const [paymentTerms, setPaymentTerms] = React.useState('Net 30');
  const [descuento, setDescuento] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Pre-fill data when solicitud changes
  React.useEffect(() => {
    if (solicitud) {
      setPoNumber(`OC-${solicitud.id?.split('-').pop() || Math.floor(1000 + Math.random() * 9000)}`);
      setSupplierName(solicitud.proveedor || '');
      setReferencia(solicitud.id || '');
      setItems(solicitud.items || []);
      
      // Auto-populate supplier details if found (case-insensitive and trimmed)
      const targetName = (solicitud.proveedor || '').trim().toLowerCase();
      const foundSupplier = proveedores.find(p => {
        const nameA = (p["RAZON SOCIAL"] || '').trim().toLowerCase();
        const nameB = (p.name || '').trim().toLowerCase();
        const nameC = (p["Nombre de Fantasia"] || '').trim().toLowerCase();
        return nameA === targetName || nameB === targetName || nameC === targetName;
      });
      
      if (foundSupplier) {
        setRazonSocial(foundSupplier["RAZON SOCIAL"] || foundSupplier.name || '');
        setRut(foundSupplier["RUT"] || foundSupplier.rut || '');
        setDireccion(foundSupplier["DIRECCION"] || foundSupplier.direccion || '');
        setCiudad(foundSupplier["CIUDAD"] || foundSupplier.ciudad || '');
        setPais(foundSupplier["PAÌS"] || foundSupplier.pais || '');
        setTelefono(foundSupplier["TELEFONO"] || foundSupplier.telefono || '');
        
        // Robust lookup for Payment Terms
        const fs = foundSupplier as any;
        const paymentValue = fs["Forma de Pago"] || 
                           fs["FORMA DE PAGO"] || 
                           fs["Forma Pago"] || 
                           fs["forma_pago"] || 
                           fs.paymentTerms || '';
        
        setPaymentTerms(paymentValue);
      }
    }
  }, [solicitud, proveedores]);

  // Helpers for items
  const updateItem = (index: number, field: string, value: any) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const addItem = () => {
    setItems(prev => [...prev, { name: '', quantity: 1, estimatedCost: 0, codigoMaterial: '', cuentaPresupuesto: '' }]);
  };

  // Financial Calculations
  const currentNeto = items.reduce((acc, item) => acc + ((Number(item.quantity) || 0) * (Number(item.estimatedCost) || 0)), 0);
  const currentIva = solicitud?.isAfectoIVA !== false ? Math.round((currentNeto - descuento) * 0.19) : 0;
  const currentTotal = (currentNeto - descuento) + currentIva;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solicitud || !poNumber || !supplierName) return;

    setIsSubmitting(true);
    try {
      await addOrdenCompra({
        solicitudId: solicitud.id || '',
        referencia,
        tipo,
        observaciones,
        supplierName,
        razonSocial,
        rut,
        direccion,
        ciudad,
        pais,
        telefono,
        email,
        formaPago: paymentTerms,
        diasEntrega: 0,
        moneda: (solicitud.moneda as any) || 'CLP',
        descuento,
        impuesto: currentIva,
        totalNeto: currentNeto - descuento,
        totalIva: currentIva,
        totalGlobal: currentTotal,
        centroCostos: solicitud.centroCostos || (solicitud as any)["Centro de Costos"],
        centroNegocios: solicitud.centroNegocios || (solicitud as any)["Centro de Negocios"],
        cuentaPresupuesto: items[0]?.cuentaPresupuesto || '',
        items: items.map(item => ({
          id: item.id || `item-${Math.random()}`,
          name: item.name,
          quantity: item.quantity,
          unitCost: item.estimatedCost,
          montoNeto: (item.quantity * item.estimatedCost),
          montoTotalIva: (item.quantity * item.estimatedCost) * (solicitud.isAfectoIVA !== false ? 1.19 : 1),
          codigoMaterial: item.codigoMaterial,
          cuentaPresupuesto: item.cuentaPresupuesto
        }))
      }, solicitud.id || '');
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error generating OC:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  function formatCurrency(value: number, currency: string = 'CLP') {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency,
    }).format(value);
  }

  if (!solicitud) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden border-none shadow-2xl rounded-sm bg-white flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="bg-slate-50/50 p-6 border-b border-slate-100 relative shrink-0">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <FileText className="h-24 w-24" />
            </div>
            <DialogHeader className="space-y-1 relative z-10">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-black text-white border-none text-[8px] font-black uppercase px-2 py-0.5 rounded-sm tracking-widest shadow-lg">
                  ORDEN DE COMPRA
                </Badge>
                <div className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Generación de Documento</span>
              </div>
              <DialogTitle className="text-2xl font-black tracking-tighter text-slate-900 uppercase">
                Emisión de Orden de Compra
              </DialogTitle>
              <DialogDescription className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                Convertir Requisición <span className="text-primary">#{solicitud.id}</span> en documento legal para proveedor
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <ScrollArea className="flex-1 w-full">
            <div className="p-6 space-y-6 bg-white pb-10">
              {/* Bloque 1: Datos de Cabecera (Idéntico a Requisición) */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50/30 p-4 rounded-md border border-slate-100">
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase text-slate-400 font-bold tracking-tight">Nro OC</Label>
                    <Input value={poNumber} onChange={(e) => setPoNumber(e.target.value)} className="h-7 text-[11px] rounded-sm border-slate-200 font-bold" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase text-slate-400 font-bold tracking-tight">Ref Requisición</Label>
                    <Input value={referencia} readOnly className="h-7 text-[11px] rounded-sm border-slate-200 bg-slate-50 font-bold" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase text-slate-400 font-bold tracking-tight">Tipo Operación</Label>
                    <Input value={tipo} onChange={(e) => setTipo(e.target.value)} className="h-7 text-[11px] rounded-sm border-slate-200" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase text-slate-400 font-bold tracking-tight">Moneda</Label>
                    <Input value={solicitud.moneda || 'CLP'} readOnly className="h-7 text-[11px] rounded-sm border-slate-200 bg-slate-50 font-bold" />
                  </div>
              </div>

              {/* Bloque 2: Información del Proveedor (Estilo Técnico) */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1">
                  Identificación del Proveedor y Logística
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-4 space-y-1">
                    <Label className="text-[9px] uppercase text-slate-400 font-bold tracking-tight">Proveedor (Selección) *</Label>
                    <SupplierAutocomplete value={supplierName} onChange={(val) => {
                        setSupplierName(val);
                        const targetVal = (val || '').trim().toLowerCase();
                        const s = proveedores.find(p => {
                          const nA = (p["RAZON SOCIAL"] || '').trim().toLowerCase();
                          const nB = (p.name || '').trim().toLowerCase();
                          const nC = (p["Nombre de Fantasia"] || '').trim().toLowerCase();
                          return nA === targetVal || nB === targetVal || nC === targetVal;
                        });
                        
                        if (s) {
                          setRazonSocial(s["RAZON SOCIAL"] || s.name || '');
                          setRut(s["RUT"] || s.rut || '');
                          setDireccion(s["DIRECCION"] || s.direccion || '');
                          setCiudad(s["CIUDAD"] || s.ciudad || '');
                          setPais(s["PAÌS"] || s.pais || '');
                          setTelefono(s["TELEFONO"] || s.telefono || '');
                          setEmail(s["EMAIL"] || s.email || '');
                          
                          // Robust lookup for Payment Terms
                          const sp = s as any;
                          const paymentValue = sp["Forma de Pago"] || 
                                             sp["FORMA DE PAGO"] || 
                                             sp["Forma Pago"] || 
                                             sp["forma_pago"] || 
                                             sp.paymentTerms || '';
                          setPaymentTerms(paymentValue);
                        }
                    }} suppliers={proveedores} />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-[9px] uppercase text-slate-400 font-bold tracking-tight">RUT</Label>
                    <Input value={rut} onChange={(e) => setRut(e.target.value)} className="h-7 text-[11px] rounded-sm border-slate-200" />
                  </div>
                  <div className="md:col-span-3 space-y-1">
                    <Label className="text-[9px] uppercase text-slate-400 font-bold tracking-tight">Email Contacto</Label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} className="h-7 text-[11px] rounded-sm border-slate-200" />
                  </div>
                  <div className="md:col-span-3 space-y-1">
                    <Label className="text-[9px] uppercase text-slate-400 font-bold tracking-tight">Teléfono</Label>
                    <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} className="h-7 text-[11px] rounded-sm border-slate-200" />
                  </div>
                  
                  <div className="md:col-span-4 space-y-1">
                    <Label className="text-[9px] uppercase text-slate-400 font-bold tracking-tight">Dirección Comercial</Label>
                    <Input value={direccion} onChange={(e) => setDireccion(e.target.value)} className="h-7 text-[11px] rounded-sm border-slate-200" />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-[9px] uppercase text-slate-400 font-bold tracking-tight">Ciudad</Label>
                    <Input value={ciudad} onChange={(e) => setCiudad(e.target.value)} className="h-7 text-[11px] rounded-sm border-slate-200" />
                  </div>
                  <div className="md:col-span-3 space-y-1">
                    <Label className="text-[9px] uppercase text-slate-400 font-bold tracking-tight">Forma de Pago</Label>
                    <Input value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} className="h-7 text-[11px] rounded-sm border-slate-200" />
                  </div>
                  <div className="md:col-span-3 space-y-1">
                    <Label className="text-[9px] uppercase text-slate-400 font-bold tracking-tight">Fecha Compromiso</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full h-7 justify-start text-left text-[11px] rounded-sm border-slate-200", !deliveryDate && "text-slate-400")}>
                          <CalendarIcon className="mr-2 h-3 w-3" />
                          {deliveryDate ? format(deliveryDate, "dd/MM/yyyy", { locale: es }) : <span>Seleccionar...</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-md overflow-hidden border-slate-200 shadow-xl">
                        <Calendar mode="single" selected={deliveryDate} onSelect={setDeliveryDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Bloque 3: Detalle de Ítems (Clon de Requisición) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Detalle de Materiales / Servicios
                  </div>
                  <Button type="button" onClick={addItem} variant="outline" className="h-6 text-[8px] font-black uppercase tracking-widest border-dashed rounded-sm px-3 hover:bg-slate-50 transition-colors">
                    <Plus className="h-3 w-3 mr-1" /> Agregar Ítem
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="relative grid grid-cols-1 md:grid-cols-12 gap-2 border p-2 rounded-sm pt-6 bg-white shadow-sm border-slate-200 hover:border-primary/40 transition-all group">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        className="absolute right-0 top-0 h-5 w-5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-sm opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X className="h-3 w-3" />
                      </Button>

                      <div className="md:col-span-1 space-y-1 text-center">
                        <Label className="text-[8px] uppercase text-slate-400 font-bold tracking-tight">#</Label>
                        <div className="h-7 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-sm text-[10px] font-bold text-slate-400">
                          {index + 1}
                        </div>
                      </div>

                      <div className="md:col-span-5 space-y-1">
                        <Label className="text-[8px] uppercase text-slate-400 font-bold tracking-tight">Descripción del Bien o Servicio</Label>
                        <ItemAutocomplete 
                          value={item.name}
                          materiales={materiales}
                          onChange={(name, mat) => {
                            updateItem(index, 'name', name);
                            if (mat) {
                              const m = mat as any;
                              updateItem(index, 'codigoMaterial', m.codigo || m['Código'] || m.code || '');
                            }
                          }}
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1">
                        <Label className="text-[8px] uppercase text-slate-400 font-bold tracking-tight">Código</Label>
                        <Input 
                          value={item.codigoMaterial || ''} 
                          onChange={(e) => updateItem(index, 'codigoMaterial', e.target.value)}
                          className="h-7 text-[11px] rounded-sm border-slate-200" 
                        />
                      </div>

                      <div className="md:col-span-1 space-y-1">
                        <Label className="text-[8px] uppercase text-slate-400 font-bold tracking-tight">Cant.</Label>
                        <Input 
                          type="number" 
                          value={item.quantity} 
                          onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                          className="h-7 text-[11px] rounded-sm border-slate-200 font-bold text-center" 
                        />
                      </div>

                      <div className="md:col-span-3 space-y-1">
                        <Label className="text-[8px] uppercase text-slate-400 font-bold tracking-tight">Precio Unitario ($)</Label>
                        <Input 
                          type="number" 
                          value={item.estimatedCost} 
                          onChange={(e) => updateItem(index, 'estimatedCost', Number(e.target.value))}
                          className="h-7 text-[11px] rounded-sm border-slate-200 font-black text-primary text-right" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bloque 4: Resumen Administrativo y Financiero */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1">
                        Observaciones e Internos
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-[9px] uppercase text-slate-400 font-bold tracking-tight">CECO</Label>
                            <Input value={solicitud.centroCostos || (solicitud as any)["Centro de Costos"] || ''} readOnly className="h-7 text-[11px] rounded-sm border-slate-200 bg-slate-50" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[9px] uppercase text-slate-400 font-bold tracking-tight">CENE</Label>
                            <Input value={solicitud.centroNegocios || (solicitud as any)["Centro de Negocios"] || ''} readOnly className="h-7 text-[11px] rounded-sm border-slate-200 bg-slate-50" />
                        </div>
                        <div className="col-span-2 space-y-1">
                            <Label className="text-[9px] uppercase text-slate-400 font-bold tracking-tight">Notas de la OC</Label>
                            <Input value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className="h-7 text-[11px] rounded-sm border-slate-200" placeholder="Escriba aquí observaciones para el proveedor..." />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-md p-6 text-white space-y-4 shadow-xl border border-slate-800">
                    <div className="flex justify-between items-center text-[11px] border-b border-white/5 pb-2">
                        <span className="text-slate-500 font-black uppercase tracking-widest">SUBTOTAL NETO</span>
                        <span className="font-bold text-slate-300">{formatCurrency(currentNeto, solicitud.moneda)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500 font-black uppercase tracking-widest">DESCUENTO ESP.</span>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-700 font-bold">-</span>
                            <Input 
                                type="number" 
                                value={descuento} 
                                onChange={(e) => setDescuento(Number(e.target.value))} 
                                className="h-6 w-20 bg-white/5 border-white/10 text-right text-[10px] rounded-sm text-primary font-black" 
                            />
                        </div>
                    </div>

                    {solicitud.isAfectoIVA !== false && (
                        <div className="flex justify-between items-center text-[11px] text-slate-400">
                            <span className="font-black uppercase tracking-widest text-[9px]">IMPUESTO IVA (19%)</span>
                            <span className="font-bold">{formatCurrency(currentIva, solicitud.moneda)}</span>
                        </div>
                    )}

                    <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                        <div className="space-y-1">
                            <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-primary">TOTAL ORDEN</span>
                            <span className="block text-[8px] text-slate-500 italic uppercase">Cierre de Negociación</span>
                        </div>
                        <span className="text-2xl font-black text-white tracking-tighter">
                            {formatCurrency(currentTotal, solicitud.moneda)}
                        </span>
                    </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 pt-2 flex gap-3 border-t bg-slate-50/50 shrink-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="h-10 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:bg-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className="h-10 bg-black hover:bg-slate-800 text-white font-black text-[11px] uppercase tracking-widest px-8 rounded-sm shadow-xl transition-all active:scale-95"
            >
              {isSubmitting ? 'Procesando...' : 'EMITIR ORDEN DE COMPRA'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
