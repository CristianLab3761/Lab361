'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle, X, Calculator, Download, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ItemAutocomplete } from '@/components/app/item-autocomplete';
import { SupplierAutocomplete } from '@/components/app/supplier-autocomplete';
import { BudgetAccountAutocomplete } from '@/components/app/budget-account-autocomplete';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppContext } from '@/context/app-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, addBusinessDays } from 'date-fns';
import { isValidBudgetAccount, getBudgetAccountNames } from '@/lib/budget-account-utils';

const itemSchema = z.object({
  name: z.string().min(1, 'El ítem es requerido'),
  codigoMaterial: z.string().optional(),
  quantity: z.coerce.number().int().min(1, 'La cantidad debe ser al menos 1'),
  estimatedCost: z.coerce.number().min(0.01, 'El costo debe ser positivo'),
  descripcion: z.string().optional(),
  cuentaPresupuesto: z.string().optional(),
  cuentaPresupuestoValid: z.boolean().optional(),
});

const createFormSchema = (proveedores: any[], cuentas: any[]) => {
  const validBudgetAccounts = getBudgetAccountNames(cuentas);

  return z.object({
    id: z.string().optional(),
    fecha: z.string().optional(),
    hora: z.string().optional(),
    solicitanteName: z.string().optional(),
    cargo: z.string().min(1, 'El cargo es requerido'),
    department: z.string().optional(),
    proveedor: z.string()
      .min(1, 'El proveedor es requerido')
      .refine((val) => {
        return proveedores.some((p) => (p['RAZON SOCIAL'] || p.razonSocial || p.name) === val);
      }, { message: 'Debe seleccionar un proveedor de la lista' }),
    autorizadoPor: z.string().optional(),
    fechaEntrega: z.string().optional(),
    status: z.string().optional(),
    fechaEstatus: z.string().optional(),
    refOC: z.string().optional(),
    items: z.array(itemSchema)
      .min(1, 'Debe agregar al menos un ítem')
      .superRefine((items, ctx) => {
        items.forEach((item, index) => {
          if (!item.cuentaPresupuesto) {
            return;
          }

          if (!isValidBudgetAccount(item.cuentaPresupuesto, validBudgetAccounts)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [index, 'cuentaPresupuesto'],
              message: 'La cuenta debe pertenecer al listado de cuentas presupuestarias',
            });
          }
        });
      }),
    comments: z.string().optional(),
    isAfectoIVA: z.boolean().default(true),
    moneda: z.enum(['CLP', 'USD', 'UF']).default('CLP'),
  });
};

type NewRequestFormValues = z.infer<ReturnType<typeof createFormSchema>>;
export function NewRequestDialog() {
  const [open, setOpen] = useState(false);
  // Track per-item validity of cuentaPresupuesto (true = valid or empty, false = invalid)
  const [cuentaValidity, setCuentaValidity] = useState<Record<number, boolean>>({});
  const { addSolicitud, currentUser, proveedores, materiales, solicitudes, dbRequisicionesV04, presupuestos: centrosCostos, cuentas } = useAppContext();
  const { toast } = useToast();

  const formSchema = createFormSchema(proveedores, cuentas).extend({
    centroCostos: z.string().min(1, 'El centro de costos es requerido'),
  });

  const form = useForm<NewRequestFormValues & { centroCostos: string }>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '',
      fecha: format(new Date(), 'yyyy-MM-dd'),
      hora: format(new Date(), 'HH:mm'),
      solicitanteName: '',
      cargo: '',
      department: currentUser?.department || '',
      centroCostos: '',
      proveedor: '',
      autorizadoPor: '',
      fechaEntrega: '',
      status: 'vigente',
      fechaEstatus: format(new Date(), 'yyyy-MM-dd'),
      refOC: '',
      items: [{ name: '', codigoMaterial: '', quantity: 1, estimatedCost: 0, cuentaPresupuesto: '', cuentaPresupuestoValid: true }],
      comments: '',
      isAfectoIVA: true,
      moneda: 'CLP',
    },
  });

  useEffect(() => {
    if (open && currentUser) {
      form.setValue('solicitanteName', currentUser.name);
      if (currentUser.cargo) form.setValue('cargo', currentUser.cargo);
      if (currentUser.department) form.setValue('department', currentUser.department);
      
      // Auto-generate next ID considering V04 and V05 with dot cleaning
      const allReqs = [...(dbRequisicionesV04 || []), ...(solicitudes || [])];
      let maxNum = 100005344; // Baseline manual solicitado
      
      allReqs.forEach(r => {
        // Intentar obtener el ID de varias columnas posibles
        const idStr = String(r["N° Requisición"] || r["REQUISICIÓN"] || r.id || "");
        // Limpiar todo lo que no sea número (puntos, guiones, letras)
        const numericPart = idStr.replace(/\D/g, "");
        if (numericPart) {
          const val = parseInt(numericPart);
          if (val > maxNum) maxNum = val;
        }
      });

      const nextNumeric = maxNum + 1;
      // Formatear con puntos (ej: 100.005.345)
      const formattedId = nextNumeric.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      form.setValue('id', formattedId);
    }
  }, [open, currentUser, form, solicitudes, dbRequisicionesV04]);

  const watchedProveedor = form.watch('proveedor');

  useEffect(() => {
    if (watchedProveedor) {
      const selectedProv = proveedores.find(p => (p["RAZON SOCIAL"] || p.razonSocial || p.name) === watchedProveedor);
      if (selectedProv) {
        const leadTimeStr = String(selectedProv["lead-time"] || '');
        const match = leadTimeStr.match(/\d+/);
        const days = match ? parseInt(match[0], 10) : 0;
        
        if (days >= 0) {
          const calculatedDate = addBusinessDays(new Date(), days);
          form.setValue('fechaEntrega', format(calculatedDate, 'yyyy-MM-dd'));
        }
      }
    }
  }, [watchedProveedor, proveedores, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const watchedItems = form.watch('items');

  useEffect(() => {
    if (!materiales) return;
    
    const clean = (s: any) => String(s || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const getVal = (obj: any, keys: string[]) => {
      for (const k of keys) if (obj[k] !== undefined && obj[k] !== null) return obj[k];
      return '';
    };

    const searchMaterial = async (item: any, index: number) => {
      if (!item?.codigoMaterial) return;
      const cleanCode = clean(item.codigoMaterial);
      let material = materiales.find((m: any) => {
        const mCode = getVal(m, ['codigo_nuevo', 'codigo', 'Código', 'Codigo', 'code']);
        return clean(mCode) === cleanCode;
      });

      if (!material) {
        try {
          const { data } = await supabase
            .from('ListaDeMateriales')
            .select('*')
            .or(`codigo.eq.${item.codigoMaterial},codigo.eq.${cleanCode}`)
            .limit(1);
          if (data && data.length > 0) material = data[0];
        } catch (e) {
          console.error("Error buscando material remoto:", e);
        }
      }

      if (material) {
        const desc = getVal(material, ['Material', 'descripcion', 'Descripcion del material', 'Descripcion', 'name', 'Name']);
        if (desc) {
          const currentName = form.getValues(`items.${index}.name`);
          if (clean(currentName) !== clean(desc)) {
            form.setValue(`items.${index}.name`, String(desc), { shouldValidate: true });
          }
        }
      }
    };

    watchedItems?.forEach((item, index) => {
      searchMaterial(item, index);
    });
  }, [watchedItems, materiales, form]);

  const onSubmit = (data: any) => {
    const invalidCuenta = data.items.some((_: any, idx: number) => cuentaValidity[idx] === false);
    if (invalidCuenta) {
      toast({
        title: 'Cuenta Presupuesto inválida',
        description: 'Uno o más ítems tienen una cuenta presupuesto que no pertenece al listado. Seleccione una opción válida.',
        variant: 'destructive',
      });
      return;
    }

    const totalEstimatedCost = data.items.reduce(
      (acc: number, item: any) => acc + item.quantity * item.estimatedCost,
      0
    );
    
    let createdAt = new Date().toISOString();
    if (data.fecha && data.hora) {
      try {
        createdAt = new Date(`${data.fecha}T${data.hora}:00`).toISOString();
      } catch (e) {}
    }

    addSolicitud({
      ...data,
      createdAt,
      items: data.items.map((item: any, index: number) => ({ ...item, id: `new-item-${index}` })),
      totalEstimatedCost,
    } as any);
    form.reset();
    setCuentaValidity({});
    setOpen(false);
  };

  const totalCalculated = form.watch('items').reduce((acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.estimatedCost) || 0), 0);
  const watchedMoneda = form.watch('moneda') || 'CLP';

  const formatCurrency = (amount: number) => {
    if (watchedMoneda === 'UF') {
      return `UF ${amount.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} UF`;
    }
    const formatter = new Intl.NumberFormat(watchedMoneda === 'CLP' ? 'es-CL' : 'en-US', {
      style: 'currency',
      currency: watchedMoneda === 'CLP' ? 'CLP' : 'USD',
    });
    return `${formatter.format(amount)} ${watchedMoneda}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva Requisición
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-7xl h-[94vh] w-[98vw] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-4 pb-2 shrink-0">
          <DialogTitle className="text-xl font-bold tracking-tight">Crear Nueva Requisición de Compra</DialogTitle>
          <DialogDescription asChild>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-slate-500 text-[10px]">Complete los detalles. Todos los campos obligatorios marcados con *.</span>
              {materiales.length > 0 && (
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-slate-200 text-[9px] font-bold px-2 py-0">
                  {materiales.length} MATERIALES
                </Badge>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <ScrollArea className="flex-1 w-full h-full">
            <div className="px-6 py-2 space-y-4">
              
              {/* Bloque Superior: Datos Generales */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:col-span-4 border p-3 rounded-md bg-slate-50/30 border-slate-200">
                  <div className="space-y-1">
                    <Label htmlFor="id" className="text-[9px] uppercase text-slate-400 font-bold tracking-tight">N° Requisición</Label>
                    <Input id="id" {...form.register('id')} readOnly className="h-7 text-[11px] rounded-sm border-slate-200 bg-slate-50 font-bold text-primary" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="fecha" className="text-[9px] uppercase text-slate-400 font-bold tracking-tight">Fecha</Label>
                    <Input id="fecha" type="date" {...form.register('fecha')} readOnly className="h-7 text-[11px] rounded-sm border-slate-200 bg-slate-50/50" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="hora" className="text-[9px] uppercase text-slate-400 font-bold tracking-tight">Hora</Label>
                    <Input id="hora" type="time" {...form.register('hora')} readOnly className="h-7 text-[11px] rounded-sm border-slate-200 bg-slate-50/50" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="status" className="text-[9px] uppercase text-slate-400 font-bold tracking-tight">Estatus</Label>
                    <Input id="status" {...form.register('status')} readOnly className="h-7 text-[11px] rounded-sm border-slate-200 bg-slate-50/50" />
                  </div>
                </div>

                {/* Proveedor y Solicitante */}
                <div className="md:col-span-2 space-y-2">
                  <div className="flex flex-col gap-1 px-3 py-2 border rounded-md bg-white border-slate-200 shadow-sm h-full">
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-[9px] uppercase text-slate-400 font-bold tracking-tight">Información de Proveedor</Label>
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                        <input 
                          type="checkbox" 
                          id="isAfectoIVA" 
                          {...form.register('isAfectoIVA')} 
                          className="w-3 h-3 rounded-sm border-slate-300 text-primary focus:ring-primary/20"
                        />
                        <Label htmlFor="isAfectoIVA" className="text-[8px] font-black text-slate-500 uppercase cursor-pointer">Afecto a IVA</Label>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <SupplierAutocomplete 
                          value={form.watch('proveedor') || ''}
                          onChange={(val) => form.setValue('proveedor', val, { shouldValidate: true })}
                          suppliers={proveedores}
                        />
                        {form.formState.errors.proveedor && (
                          <p className="text-[10px] text-destructive font-bold mt-0.5 ml-1">
                            {form.formState.errors.proveedor.message}
                          </p>
                        )}
                      </div>
                      <div className="w-16">
                        <div className="h-7 bg-slate-50/50 border border-slate-200 rounded-sm flex items-center justify-center text-[9px] font-mono text-slate-400" title="Lead Time">
                          {proveedores.find(p => (p["RAZON SOCIAL"] || p.name) === form.watch('proveedor'))?.["lead-time"] || 'S/D'}
                        </div>
                      </div>
                    </div>

                    {form.watch('proveedor') && proveedores.find(p => (p["RAZON SOCIAL"] || p.razonSocial || p.name) === form.watch('proveedor')) && (
                      <div className="mt-1 text-[9px] text-slate-500 bg-slate-50/50 p-1.5 rounded border border-slate-100 grid grid-cols-2 gap-x-2">
                        {(() => {
                          const s = proveedores.find(p => (p["RAZON SOCIAL"] || p.razonSocial || p.name) === form.watch('proveedor'));
                          if (!s) return null;
                          return (
                            <>
                              <div className="truncate"><span className="font-bold text-slate-300 uppercase text-[7px]">RUT:</span> {s["RUT"] || s.rut || 'S/R'}</div>
                              <div className="truncate"><span className="font-bold text-slate-300 uppercase text-[7px]">Ciudad:</span> {s["CIUDAD"] || s.ciudad || 'S/C'}</div>
                              <div className="col-span-2 truncate"><span className="font-bold text-slate-300 uppercase text-[7px]">Dirección:</span> {s["DIRECCION"] || s.direccion || 'S/D'}</div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2 grid grid-cols-2 gap-2 border p-3 rounded-md bg-white border-slate-200 shadow-sm">
                  <div className="space-y-1">
                    <Label htmlFor="solicitanteName" className="text-[9px] uppercase text-slate-400 font-bold tracking-tight">Solicitante</Label>
                    <Input id="solicitanteName" {...form.register('solicitanteName')} className="h-7 text-[11px] rounded-sm border-slate-200" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="cargo" className="text-[9px] uppercase text-slate-400 font-bold tracking-tight">Cargo</Label>
                    <Input id="cargo" {...form.register('cargo')} className="h-7 text-[11px] rounded-sm border-slate-200" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="department" className="text-[9px] uppercase text-slate-400 font-bold tracking-tight">Departamento</Label>
                    <Input id="department" {...form.register('department')} className="h-7 text-[11px] rounded-sm border-slate-200" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="centroCostos" className="text-[9px] uppercase text-primary font-bold tracking-tight">Centro de Costos *</Label>
                    <Select onValueChange={(val) => form.setValue('centroCostos', val)} value={form.watch('centroCostos')}>
                      <SelectTrigger id="centroCostos" className="h-7 text-[10px] rounded-sm border-slate-200 bg-slate-50/50">
                        <SelectValue placeholder="Seleccionar CECO" />
                      </SelectTrigger>
                      <SelectContent>
                        {centrosCostos.map((ceco: any, idx: number) => (
                          <SelectItem key={`${ceco.code}-${ceco.area}-${idx}`} value={`${ceco.code} - ${ceco.name}`} className="text-xs">
                            {ceco.code} - {ceco.name} ({ceco.area})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label htmlFor="moneda" className="text-[9px] uppercase text-slate-400 font-bold tracking-tight">Moneda</Label>
                    <Select onValueChange={(val) => form.setValue('moneda', val as any)} value={form.watch('moneda')}>
                      <SelectTrigger id="moneda" className="h-7 text-[11px] rounded-sm border-slate-200">
                        <SelectValue placeholder="CLP" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CLP" className="text-xs">CLP</SelectItem>
                        <SelectItem value="USD" className="text-xs">USD</SelectItem>
                        <SelectItem value="UF" className="text-xs">UF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-2 border p-3 rounded-md bg-slate-50/10 border-slate-200">
                  <div className="space-y-1">
                    <Label htmlFor="autorizadoPor" className="text-[9px] uppercase text-slate-400 font-bold tracking-tight">Autorizado por</Label>
                    <Input id="autorizadoPor" {...form.register('autorizadoPor')} className="h-7 text-[11px] rounded-sm border-slate-200" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="fechaEntrega" className="text-[9px] uppercase text-primary font-bold tracking-tight">Fecha Entrega</Label>
                    <Input id="fechaEntrega" type="date" {...form.register('fechaEntrega')} className="h-7 text-[11px] rounded-sm border-slate-200" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="fechaEstatus" className="text-[9px] uppercase text-slate-400 font-bold tracking-tight">Fecha Estatus</Label>
                    <Input id="fechaEstatus" type="date" {...form.register('fechaEstatus')} readOnly className="h-7 text-[11px] rounded-sm border-slate-200 bg-slate-50/50" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="refOC" className="text-[9px] uppercase text-slate-400 font-bold tracking-tight">Ref OC</Label>
                    <Input id="refOC" {...form.register('refOC')} className="h-7 text-[11px] rounded-sm border-slate-200" />
                  </div>
                </div>
              </div>

              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1 mt-2">
                Detalle de Ítems (Item, Cód Material, Unidades, Descripción, Cuenta Presupuesto, Precio Unitario)
              </div>
              
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="relative grid grid-cols-1 md:grid-cols-12 gap-2 border p-3 rounded-md pt-7 bg-white shadow-sm border-slate-200">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="absolute right-1 top-1 h-5 w-5 text-slate-300 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    
                    <div className="md:col-span-1 space-y-1">
                      <Label className="text-[9px] uppercase text-slate-400 font-bold tracking-tight">Item</Label>
                      <Input value={index + 1} readOnly className="h-7 text-[11px] rounded-sm border-slate-200 bg-slate-50 font-bold text-center" />
                    </div>

                    <div className="md:col-span-11 space-y-1">
                      <Label className="text-[9px] uppercase text-slate-400 font-bold tracking-tight">Descripción Material / Servicio *</Label>
                      <ItemAutocomplete 
                        value={form.watch(`items.${index}.name`)}
                        materiales={materiales}
                        placeholder="Escriba descripción o código..."
                        disabled={!!form.watch(`items.${index}.codigoMaterial`) && !!form.watch(`items.${index}.name`)}
                        onChange={(name, material) => {
                          form.setValue(`items.${index}.name`, name);
                          if (material) {
                            const m = material as any;
                            form.setValue(`items.${index}.codigoMaterial`, m.codigo_nuevo || m.codigo || m['Código'] || m.code || '');
                          }
                        }}
                      />
                    </div>
                    
                    <div className="md:col-span-3 space-y-1">
                      <Label className="text-[9px] uppercase text-slate-400 font-bold tracking-tight">Código Material</Label>
                      <Input 
                        {...form.register(`items.${index}.codigoMaterial`)} 
                        className={cn(
                          "h-7 text-[11px] rounded-sm border-slate-200 transition-all",
                          (!!form.watch(`items.${index}.codigoMaterial`) && !!form.watch(`items.${index}.name`)) && "bg-slate-50/50 text-slate-500 cursor-not-allowed border-slate-100"
                        )}
                        readOnly={!!form.watch(`items.${index}.codigoMaterial`) && !!form.watch(`items.${index}.name`)}
                        onBlur={async (e) => {
                          const code = e.target.value?.trim();
                          if (!code || !materiales) return;
                          
                          const cleanStr = (s: any) => String(s || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                          const cleanCode = cleanStr(code);
                          
                          console.log("Buscando material con código:", code, "Limpio:", cleanCode);

                          // 1. Buscar en memoria local (contexto)
                          let material = materiales.find((m: any) => {
                            const mCode = m.codigo || m.codigo_nuevo || m['Código'] || m.code || m.Code;
                            return cleanStr(mCode) === cleanCode;
                          });

                          // 2. Si no está en memoria, buscar en Supabase
                          if (!material) {
                            try {
                              const { data } = await supabase
                                .from('ListaDeMateriales')
                                .select('*')
                                .or(`codigo.eq."${code}",codigo.eq."${cleanCode}"`)
                                .limit(1);
                              if (data && data.length > 0) material = data[0];
                            } catch (err) {
                              console.error("Error buscando material en Supabase:", err);
                            }
                          }

                          if (material) {
                            console.log("Material encontrado:", material);
                            const m = material as any;
                            const desc = m.descripcion || m.Material || m['Descripcion del material'] || m.name || m.Name;
                            if (desc) {
                              form.setValue(`items.${index}.name`, String(desc), { shouldValidate: true });
                              toast({
                                title: "Material Encontrado",
                                description: `Se ha cargado la descripción: ${desc}`,
                              });
                            }
                          } else {
                            console.warn("No se encontró material con código:", code);
                          }
                        }}
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <Label className="text-[9px] uppercase text-slate-400 font-bold tracking-tight">Unidades *</Label>
                      <Input type="number" {...form.register(`items.${index}.quantity`, { valueAsNumber: true })} className="h-7 text-[11px] rounded-sm border-slate-200" />
                    </div>

                    <div className="md:col-span-3 space-y-1">
                      <Label className="text-[9px] uppercase text-slate-400 font-bold tracking-tight">Precio Unitario *</Label>
                      <Input type="number" {...form.register(`items.${index}.estimatedCost`, { valueAsNumber: true })} className="h-7 text-[11px] rounded-sm border-slate-200" />
                    </div>

                    <div className="md:col-span-4 space-y-1">
                      <Label className={cn(
                        "text-[9px] uppercase font-bold tracking-tight",
                        cuentaValidity[index] === false ? "text-red-500" : "text-slate-400"
                      )}>
                        Cuenta Presupuesto
                        {cuentaValidity[index] === false && (
                          <span className="ml-1 font-normal normal-case">(debe ser del listado)</span>
                        )}
                      </Label>
                      <BudgetAccountAutocomplete
                        value={form.watch(`items.${index}.cuentaPresupuesto`) || ''}
                        cuentas={cuentas}
                        placeholder="Buscar cuenta..."
                        hasError={cuentaValidity[index] === false}
                        onChange={(val, isValid) => {
                          form.setValue(`items.${index}.cuentaPresupuesto`, val);
                          // Only mark invalid if something is typed but doesn't match
                          setCuentaValidity(prev => ({
                            ...prev,
                            [index]: val === '' ? true : isValid,
                          }));
                        }}
                      />
                    </div>

                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => append({ name: '', codigoMaterial: '', quantity: 1, estimatedCost: 0, cuentaPresupuesto: '', cuentaPresupuestoValid: true })}
                className="w-full border-dashed h-8 text-[10px] mt-2 uppercase font-bold text-slate-400 hover:text-slate-600"
              >
                <PlusCircle className="mr-2 h-3.5 w-3.5" />
                Agregar Ítem
              </Button>
            </div>
          </ScrollArea>

          <div className="px-6 py-4 border-t bg-white flex items-center justify-between">
            <div className="flex items-center text-sm font-bold text-slate-900 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                 <Calculator className="mr-2 h-4 w-4 text-primary" />
                 <span className="text-slate-400 font-medium mr-2">Total Estimado:</span> {formatCurrency(totalCalculated)}
             </div>
            
            <div className="flex items-center gap-2">
              <Button 
                type="button" 
                variant="ghost" 
                className="text-slate-500 hover:text-slate-900 h-9 px-4 text-xs font-medium"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              

              
              <Button 
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white h-9 px-6 text-xs font-bold shadow-lg shadow-primary/20"
              >
                Crear Requisición
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
