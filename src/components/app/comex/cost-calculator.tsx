'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function CostCalculator() {
  // Costos
  const [fob, setFob] = useState<number>(0);
  const [freight, setFreight] = useState<number>(0);
  const [insurance, setInsurance] = useState<number>(0);
  const [taxes, setTaxes] = useState<number>(0);
  const [localCosts, setLocalCosts] = useState<number>(0);

  // Unidades de medida
  const [units, setUnits] = useState<number>(1);
  const [liters, setLiters] = useState<number>(0);
  const [boxes, setBoxes] = useState<number>(0);
  const [pallets, setPallets] = useState<number>(0);

  const totalCost = fob + freight + insurance + taxes + localCosts;

  const costPerUnit = units > 0 ? totalCost / units : 0;
  const costPerLiter = liters > 0 ? totalCost / liters : 0;
  const costPerBox = boxes > 0 ? totalCost / boxes : 0;
  const costPerPallet = pallets > 0 ? totalCost / pallets : 0;

  const formatCurrency = (val: number) => 
    `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Columna de Inputs */}
      <div className="lg:col-span-8 space-y-8">
        
        {/* Desglose de Costos */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            1. Desglose de Gastos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fob">Valor Mercancía (FOB/EXW)</Label>
              <Input 
                id="fob" type="number" min="0" step="0.01" 
                value={fob || ''} onChange={(e) => setFob(Number(e.target.value))} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="freight">Flete Internacional</Label>
              <Input 
                id="freight" type="number" min="0" step="0.01" 
                value={freight || ''} onChange={(e) => setFreight(Number(e.target.value))} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="insurance">Seguro</Label>
              <Input 
                id="insurance" type="number" min="0" step="0.01" 
                value={insurance || ''} onChange={(e) => setInsurance(Number(e.target.value))} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxes">Impuestos / Aranceles</Label>
              <Input 
                id="taxes" type="number" min="0" step="0.01" 
                value={taxes || ''} onChange={(e) => setTaxes(Number(e.target.value))} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="localCosts">Gastos Locales (Maniobras)</Label>
              <Input 
                id="localCosts" type="number" min="0" step="0.01" 
                value={localCosts || ''} onChange={(e) => setLocalCosts(Number(e.target.value))} 
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Unidades de Conversión */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            2. Volúmenes y Cantidades
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="units">Total Unidades</Label>
              <Input 
                id="units" type="number" min="0" 
                value={units || ''} onChange={(e) => setUnits(Number(e.target.value))} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="liters">Total Litros</Label>
              <Input 
                id="liters" type="number" min="0" step="0.01" 
                value={liters || ''} onChange={(e) => setLiters(Number(e.target.value))} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="boxes">Total Cajas</Label>
              <Input 
                id="boxes" type="number" min="0" 
                value={boxes || ''} onChange={(e) => setBoxes(Number(e.target.value))} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pallets">Total Pallets</Label>
              <Input 
                id="pallets" type="number" min="0" 
                value={pallets || ''} onChange={(e) => setPallets(Number(e.target.value))} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Columna de Resultados */}
      <div className="lg:col-span-4">
        <Card className="p-6 bg-slate-50 border-slate-200 h-full flex flex-col justify-center">
          <h3 className="text-xl font-bold text-center mb-6 text-slate-800">Resultados</h3>
          
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-slate-500 mb-1 uppercase font-semibold tracking-wider">Costo Total (Landed Cost)</p>
              <p className="text-4xl font-black text-primary">{formatCurrency(totalCost)}</p>
            </div>

            <Separator className="bg-slate-200" />

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-lg border border-slate-100 text-center shadow-sm">
                <p className="text-xs text-slate-500 mb-1">Costo / Unidad</p>
                <p className="text-lg font-bold text-slate-700">{formatCurrency(costPerUnit)}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-100 text-center shadow-sm">
                <p className="text-xs text-slate-500 mb-1">Costo / Litro</p>
                <p className="text-lg font-bold text-slate-700">{formatCurrency(costPerLiter)}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-100 text-center shadow-sm">
                <p className="text-xs text-slate-500 mb-1">Costo / Caja</p>
                <p className="text-lg font-bold text-slate-700">{formatCurrency(costPerBox)}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-100 text-center shadow-sm">
                <p className="text-xs text-slate-500 mb-1">Costo / Pallet</p>
                <p className="text-lg font-bold text-slate-700">{formatCurrency(costPerPallet)}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
