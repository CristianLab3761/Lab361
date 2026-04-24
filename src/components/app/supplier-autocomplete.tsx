'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Proveedor } from '@/lib/types';

interface SupplierAutocompleteProps {
  value: string;
  onChange: (value: string, supplier?: Proveedor) => void;
  suppliers: Proveedor[];
  placeholder?: string;
}

export function SupplierAutocomplete({
  value,
  onChange,
  suppliers,
  placeholder = "Buscar proveedor...",
}: SupplierAutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState(value);

  // Update internal search value when external value changes
  React.useEffect(() => {
    setSearchValue(value);
  }, [value]);

  const filteredSuppliers = React.useMemo(() => {
    if (!searchValue) return [];
    return suppliers.filter((s) => {
      const name = String(s?.["RAZON SOCIAL"] || s?.razonSocial || s?.name || "").toLowerCase();
      const fantasyName = String(s?.["Nombre de Fantasia"] || "").toLowerCase();
      const rut = String(s?.RUT || s?.rut || "").toLowerCase();
      const search = searchValue.toLowerCase();
      return name.includes(search) || fantasyName.includes(search) || rut.includes(search);
    }).slice(0, 10);
  }, [suppliers, searchValue]);

  return (
    <div className="relative w-full">
      <Input
        value={searchValue}
        onChange={(e) => {
          const val = e.target.value;
          setSearchValue(val);
          onChange(val);
          if (val.length > 0) setOpen(true);
          else setOpen(false);
        }}
        onFocus={() => {
          if (searchValue.length > 0) setOpen(true);
        }}
        placeholder={placeholder}
        className="w-full h-7 text-[11px] rounded-sm border-slate-200 bg-white"
        autoComplete="off"
      />
      {open && filteredSuppliers.length > 0 && (
        <div className="absolute z-[100] w-full md:min-w-[450px] left-0 mt-1 bg-white border border-slate-200 rounded-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <ScrollArea className={cn("max-h-[250px]", filteredSuppliers.length > 5 ? "h-[250px]" : "h-auto")}>
            <div className="p-1">
              {filteredSuppliers.map((supplier) => {
                const supplierName = supplier["RAZON SOCIAL"] || supplier.razonSocial || supplier.name || "Sin nombre";
                return (
                  <button
                    key={supplier.id}
                    type="button"
                    className="w-full text-left px-2 py-1.5 text-[11px] hover:bg-slate-50 rounded flex items-center justify-between gap-3 transition-all group"
                    onClick={() => {
                      onChange(supplierName, supplier);
                      setSearchValue(supplierName);
                      setOpen(false);
                    }}
                  >
                    <div className="flex flex-col gap-0.5 overflow-hidden flex-1">
                      <span className="font-bold text-slate-800 truncate leading-tight">{supplierName}</span>
                      <span className="text-[9px] text-slate-400 font-mono tracking-tight uppercase leading-tight">
                        {supplier["Nombre de Fantasia"] || "Razón Social"}
                      </span>
                    </div>
                    <div className="shrink-0">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded-sm text-[9px] font-black font-mono text-slate-500 border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        {supplier.RUT || supplier.rut || 'S/RUT'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )}
      {/* Backdrop to close the dropdown */}
      {open && (
        <div 
          className="fixed inset-0 z-[90] bg-transparent" 
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
