'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Material } from '@/lib/types';

interface ItemAutocompleteProps {
  value: string;
  onChange: (value: string, material?: Material) => void;
  materiales: Material[];
  placeholder?: string;
  displayField?: 'descripcion' | 'codigo';
  disabled?: boolean;
}

export function ItemAutocomplete({
  value,
  onChange,
  materiales,
  placeholder = "Buscar ítem...",
  displayField = 'descripcion',
  disabled = false,
}: ItemAutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState(value);
  const deferredSearch = React.useDeferredValue(searchValue);

  // Update internal search value when external value changes
  React.useEffect(() => {
    setSearchValue(value || '');
  }, [value]);

  const getVal = React.useCallback((obj: any, keys: string[]) => {
    for (const k of keys) {
      if (obj[k] !== undefined && obj[k] !== null) {
        return obj[k];
      }
    }
    return '';
  }, []);

  const searchableMateriales = React.useMemo(() => {
    return (materiales || []).map((material) => {
      const m = material as any;
      const desc = String(getVal(m, ['Material', 'descripcion', 'Descripcion del material', 'Descripcion', 'name', 'Name'])).toLowerCase();
      const cod = String(getVal(m, ['codigo_nuevo', 'codigo', 'Código', 'Codigo', 'code'])).toLowerCase();

      return {
        material,
        desc,
        cod,
      };
    });
  }, [materiales, getVal]);

  const filteredMateriales = React.useMemo(() => {
    const search = deferredSearch.trim().toLowerCase();

    if (!search) {
      return [];
    }

    return searchableMateriales
      .filter(({ desc, cod }) => desc.includes(search) || cod.includes(search))
      .slice(0, 10);
  }, [searchableMateriales, deferredSearch]);

  return (
    <div className="relative w-full">
      <Input
        value={searchValue}
        onChange={(e) => {
          const val = e.target.value;
          setSearchValue(val);
          onChange(val);
          setOpen(!disabled && val.length > 0);
        }}
        onFocus={() => {
          if (!disabled && searchValue.length > 0) {
            setOpen(true);
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full h-7 text-[11px] rounded-sm border-slate-200 transition-all",
          disabled && "bg-slate-50/50 text-slate-500 cursor-not-allowed opacity-100 border-slate-100"
        )}
        autoComplete="off"
      />
      {open && filteredMateriales.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <ScrollArea className={cn("max-h-[250px]", filteredMateriales.length > 5 ? "h-[250px]" : "h-auto")}>
            <div className="p-1">
              {filteredMateriales.map(({ material }) => (
                <button
                  key={material.id}
                  type="button"
                  className="w-full text-left px-2 py-1.5 text-[11px] hover:bg-slate-50 rounded flex items-center justify-between gap-3 transition-all group"
                  onClick={() => {
                    const m = material as any;
                    const desc = getVal(m, ['Material', 'descripcion', 'Descripcion del material', 'Descripcion', 'name', 'Name']);
                    const cod = getVal(m, ['codigo_nuevo', 'codigo', 'Código', 'Codigo', 'code']);

                    const newValue = displayField === 'descripcion' ? String(desc) : String(cod);
                    onChange(newValue, material);
                    setSearchValue(newValue);
                    setOpen(false);
                  }}
                >
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    <span className="font-bold text-slate-800 truncate">
                      {(material as any).Material || (material as any).descripcion || (material as any)['Descripcion del material'] || (material as any).name || 'Sin descripción'}
                    </span>
                  </div>
                  <div className="shrink-0">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded-sm text-[9px] font-black font-mono text-slate-500 border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                      {(material as any).codigo_nuevo || (material as any).codigo || (material as any)['Código'] || (material as any).code || 'S/C'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
