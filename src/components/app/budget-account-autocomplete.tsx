'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { getBudgetAccountNames, isValidBudgetAccount, normalizeBudgetAccount, rankBudgetAccounts } from '@/lib/budget-account-utils';

interface BudgetAccountAutocompleteProps {
  value: string;
  onChange: (value: string, isValid: boolean) => void;
  cuentas: any[];
  placeholder?: string;
  hasError?: boolean;
}

export function BudgetAccountAutocomplete({
  value,
  onChange,
  cuentas,
  placeholder = 'Buscar cuenta presupuesto...',
  hasError,
}: BudgetAccountAutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value);

  const validAccounts = React.useMemo(() => getBudgetAccountNames(cuentas), [cuentas]);
  const normalizedInput = React.useMemo(() => normalizeBudgetAccount(inputValue), [inputValue]);
  const isValid = React.useMemo(() => isValidBudgetAccount(inputValue, validAccounts), [inputValue, validAccounts]);

  const filteredAccounts = React.useMemo(() => rankBudgetAccounts(inputValue, validAccounts), [inputValue, validAccounts]);
  const exactMatch = React.useMemo(
    () => filteredAccounts.some((name) => normalizeBudgetAccount(name) === normalizedInput),
    [filteredAccounts, normalizedInput]
  );

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSelect = (name: string) => {
    setInputValue(name);
    onChange(name, true);
    setOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val, isValidBudgetAccount(val, validAccounts));
    setOpen(val.length > 0);
  };

  const showValid = inputValue && isValid;
  const showInvalid = inputValue && !isValid;

  return (
    <div className="relative w-full">
      <div className="relative">
        <Input
          value={inputValue}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={cn(
            'w-full h-7 text-[11px] rounded-sm pr-6 transition-all',
            showValid && 'border-emerald-400 bg-emerald-50/30 focus-visible:ring-emerald-400/20',
            showInvalid && 'border-red-400 bg-red-50/30 focus-visible:ring-red-400/20',
            hasError && 'border-red-400 bg-red-50/30',
            !inputValue && 'border-slate-200 bg-white'
          )}
        />
        {showValid && (
          <CheckCircle2 className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-500 pointer-events-none" />
        )}
        {showInvalid && (
          <AlertCircle className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-red-500 pointer-events-none" />
        )}
      </div>

      {open && filteredAccounts.length > 0 && (
        <div className="absolute z-[100] w-full min-w-[300px] left-0 mt-1 bg-white border border-slate-200 rounded-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
          <div className="px-2 py-1 border-b bg-slate-50/80 text-[8px] font-black uppercase text-slate-400 tracking-widest flex items-center justify-between gap-2">
            <span>Cuentas Presupuesto</span>
            {inputValue && !exactMatch && (
              <span className="text-[7px] font-semibold normal-case text-amber-600">
                Mostrando las más similares
              </span>
            )}
          </div>
          <ScrollArea className={cn('max-h-[200px]', filteredAccounts.length > 5 ? 'h-[200px]' : 'h-auto')}>
            <div className="p-1">
              {filteredAccounts.map((name: string, idx: number) => {
                const isSelected = normalizeBudgetAccount(name) === normalizedInput;
                return (
                  <button
                    key={`${name}-${idx}`}
                    type="button"
                    className={cn(
                      'w-full text-left px-2 py-1.5 text-[11px] rounded flex items-center gap-2 transition-all',
                      isSelected
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    )}
                    onClick={() => handleSelect(name)}
                  >
                    {isSelected && <CheckCircle2 className="h-3 w-3 shrink-0 text-primary" />}
                    <span className="truncate">{name}</span>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[90] bg-transparent"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
