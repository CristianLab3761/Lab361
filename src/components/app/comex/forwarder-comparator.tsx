'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Trophy, Globe } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ForwarderQuote {
  id: string;
  name: string;
  route: string;
  transitTime: number;
  freightCost: number;
  otherCosts: number;
}

export default function ForwarderComparator() {
  const [quotes, setQuotes] = useState<ForwarderQuote[]>([]);
  const [newQuote, setNewQuote] = useState<Partial<ForwarderQuote>>({
    name: '',
    route: '',
    transitTime: 0,
    freightCost: 0,
    otherCosts: 0,
  });

  const handleAddQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuote.name || !newQuote.route) return;

    const quote: ForwarderQuote = {
      id: Math.random().toString(36).substr(2, 9),
      name: newQuote.name,
      route: newQuote.route,
      transitTime: Number(newQuote.transitTime),
      freightCost: Number(newQuote.freightCost),
      otherCosts: Number(newQuote.otherCosts),
    };

    setQuotes([...quotes, quote]);
    setNewQuote({
      name: '',
      route: '',
      transitTime: 0,
      freightCost: 0,
      otherCosts: 0,
    });
  };

  const removeQuote = (id: string) => {
    setQuotes(quotes.filter((q) => q.id !== id));
  };

  const bestOption = quotes.length > 0 
    ? [...quotes].sort((a, b) => (a.freightCost + a.otherCosts) - (b.freightCost + b.otherCosts))[0] 
    : null;

  return (
    <div className="space-y-8">
      {/* Formulario para agregar */}
      <Card className="p-6 border border-slate-100 bg-white">
        <h3 className="text-lg font-semibold mb-4 text-slate-800">Agregar Cotización</h3>
        <form onSubmit={handleAddQuote} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="name">Forwarder / Agencia</Label>
            <Input 
              id="name" 
              placeholder="Ej. Kuehne+Nagel" 
              value={newQuote.name} 
              onChange={(e) => setNewQuote({ ...newQuote, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2 lg:col-span-1">
            <Label htmlFor="route">Ruta</Label>
            <Input 
              id="route" 
              placeholder="Ej. Shanghai - Manzanillo" 
              value={newQuote.route} 
              onChange={(e) => setNewQuote({ ...newQuote, route: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2 lg:col-span-1">
            <Label htmlFor="transitTime">TT (Días)</Label>
            <Input 
              id="transitTime" 
              type="number" 
              min="0"
              value={newQuote.transitTime || ''} 
              onChange={(e) => setNewQuote({ ...newQuote, transitTime: Number(e.target.value) })}
              required
            />
          </div>
          <div className="space-y-2 lg:col-span-1">
            <Label htmlFor="freightCost">Flete (USD)</Label>
            <Input 
              id="freightCost" 
              type="number" 
              min="0"
              step="0.01"
              value={newQuote.freightCost || ''} 
              onChange={(e) => setNewQuote({ ...newQuote, freightCost: Number(e.target.value) })}
              required
            />
          </div>
          <div className="space-y-2 lg:col-span-1">
            <Label htmlFor="otherCosts">Otros Gastos (USD)</Label>
            <Input 
              id="otherCosts" 
              type="number" 
              min="0"
              step="0.01"
              value={newQuote.otherCosts || ''} 
              onChange={(e) => setNewQuote({ ...newQuote, otherCosts: Number(e.target.value) })}
            />
          </div>
          <div className="lg:col-span-6 flex justify-end mt-2">
            <Button type="submit" className="gap-2">
              <Plus className="h-4 w-4" />
              Agregar Opción
            </Button>
          </div>
        </form>
      </Card>

      {/* Tabla Comparativa */}
      {quotes.length > 0 ? (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Forwarder</TableHead>
                <TableHead>Ruta</TableHead>
                <TableHead className="text-center">T. Tránsito</TableHead>
                <TableHead className="text-right">Costo Flete</TableHead>
                <TableHead className="text-right">Otros Gastos</TableHead>
                <TableHead className="text-right font-bold text-slate-900">Costo Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => {
                const total = quote.freightCost + quote.otherCosts;
                const isBest = bestOption?.id === quote.id;
                
                return (
                  <TableRow key={quote.id} className={isBest ? 'bg-amber-50/50' : ''}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {quote.name}
                        {isBest && <Trophy className="h-4 w-4 text-amber-500" />}
                      </div>
                    </TableCell>
                    <TableCell>{quote.route}</TableCell>
                    <TableCell className="text-center">{quote.transitTime} días</TableCell>
                    <TableCell className="text-right">${quote.freightCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right">${quote.otherCosts.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className={`text-right font-bold ${isBest ? 'text-amber-700' : 'text-slate-900'}`}>
                      ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => removeQuote(quote.id)} className="text-slate-400 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <Globe className="h-10 w-10 mx-auto text-slate-300 mb-3" />
          <p>No hay cotizaciones registradas.</p>
          <p className="text-sm">Agrega opciones arriba para comenzar a comparar.</p>
        </div>
      )}
    </div>
  );
}
