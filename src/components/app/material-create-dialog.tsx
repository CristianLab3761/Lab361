'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppContext } from '@/context/app-context';
import { Plus, Package, Hash, Tag, Layers } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function MaterialCreateDialog() {
  const { addAdminItem, materiales, familias } = useAppContext();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    familia: '',
    subfamilia: '',
    unidad: 'UN',
    codigo: ''
  });

  // Lógica para autogenerar el código basado en el prefijo de la familia
  useEffect(() => {
    if (formData.familia) {
      // Buscamos el prefijo en la lista dinámica de familias (con protección de nulidad)
      const familiaSeleccionada = (familias || []).find(f => f.nombre === formData.familia || f.prefijo === formData.familia);
      const prefijo = familiaSeleccionada?.prefijo || formData.familia;
      
      // Filtrar materiales de la misma familia para encontrar el siguiente correlativo
      const correlativos = (materiales || [])
        .filter(m => m.codigo?.startsWith(prefijo))
        .map(m => {
          const num = parseInt(m.codigo.replace(prefijo, ''));
          return isNaN(num) ? 0 : num;
        });
      
      const nextNum = correlativos.length > 0 ? Math.max(...correlativos) + 1 : 1;
      const formattedNum = String(nextNum).padStart(4, '0');
      
      setFormData(prev => ({ ...prev, codigo: `${prefijo}${formattedNum}` }));
    } else {
      setFormData(prev => ({ ...prev, codigo: '' }));
    }
  }, [formData.familia, materiales]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.familia || !formData.codigo) {
      toast({
        title: "Error",
        description: "Por favor complete los campos obligatorios.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await addAdminItem('ListaDeMateriales', {
        descripcion: formData.nombre,
        Material: formData.nombre,
        codigo: formData.codigo,
        codigo_nuevo: formData.codigo,
        familia: formData.familia,
        subfamilia: formData.subfamilia,
        unidad_medida: formData.unidad,
        createdAt: new Date().toISOString()
      });

      toast({
        title: "Material Creado",
        description: `El material ${formData.codigo} ha sido registrado exitosamente.`,
      });
      setOpen(false);
      setFormData({ nombre: '', familia: '', subfamilia: '', unidad: 'UN', codigo: '' });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "No se pudo crear el material.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 transition-all font-bold">
          <Plus className="mr-2 h-4 w-4" /> Crear Nuevo Material
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-3xl border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-slate-900 uppercase tracking-tight">Nuevo Material</DialogTitle>
          <DialogDescription className="text-slate-500">
            Defina el nuevo producto. El código se generará automáticamente según la familia seleccionada.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nombre del Material</Label>
            <div className="relative">
              <Package className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                id="nombre" 
                placeholder="Ej: Pala punta huevo" 
                className="pl-10 rounded-xl border-slate-200 h-11 focus:ring-indigo-500"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Familia (Prefijo)</Label>
              <Select 
                onValueChange={(val) => setFormData({...formData, familia: val})}
                value={formData.familia}
              >
                <SelectTrigger className="rounded-xl border-slate-200 h-11">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200">
                  {(familias || []).map((f, index) => (
                    <SelectItem key={f.id || `fam-${index}`} value={f.prefijo || `pref-${index}`}>
                      {f.nombre || 'Sin nombre'} ({f.prefijo || 'S/P'})
                    </SelectItem>
                  ))}
                  {(!familias || familias.length === 0) && (
                    <div className="p-4 text-center text-xs text-slate-500 italic">
                      No hay familias creadas. Créelas en Administración.
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="codigo" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Código Generado</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-3 h-4 w-4 text-indigo-400" />
                <Input 
                  id="codigo" 
                  readOnly 
                  className="pl-10 rounded-xl border-indigo-100 bg-indigo-50/50 font-mono font-bold text-indigo-700 h-11"
                  value={formData.codigo}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subfamilia" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sub-Familia</Label>
              <div className="relative">
                <Layers className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  id="subfamilia" 
                  placeholder="Ej: Manual" 
                  className="pl-10 rounded-xl border-slate-200 h-11"
                  value={formData.subfamilia}
                  onChange={(e) => setFormData({...formData, subfamilia: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unidad" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unidad de Medida</Label>
              <div className="relative">
                <Tag className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  id="unidad" 
                  placeholder="UN, KG, MT..." 
                  className="pl-10 rounded-xl border-slate-200 h-11 uppercase"
                  value={formData.unidad}
                  onChange={(e) => setFormData({...formData, unidad: e.target.value})}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setOpen(false)}
              className="rounded-xl font-bold text-slate-500"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-8 font-bold min-w-[140px]"
            >
              {loading ? "Creando..." : "Guardar Material"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
