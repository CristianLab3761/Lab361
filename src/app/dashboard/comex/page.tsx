'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { EnvioComex } from '@/lib/comex';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Globe, Search, ArrowRight, PackageOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import NewEnvioDialog from '@/components/app/comex/new-envio-dialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ComexPage() {
  const [envios, setEnvios] = useState<EnvioComex[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchEnvios = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('envios_comex')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      setEnvios(data as EnvioComex[]);
    } else if (error) {
      console.error('Error fetching envios:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEnvios();
  }, []);

  const filteredEnvios = envios.filter(e => 
    e.reference.toLowerCase().includes(search.toLowerCase()) ||
    e.origin.toLowerCase().includes(search.toLowerCase()) ||
    e.destination.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Globe className="h-8 w-8 text-primary" />
            Gestión de Envíos (Comex)
          </h1>
          <p className="text-slate-500 text-lg">
            Administra tus importaciones/exportaciones, cotizaciones logísticas y costos.
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2 shadow-brand h-12 px-6 rounded-xl text-base">
          <Plus className="h-5 w-5" />
          Nuevo Envío
        </Button>
      </div>

      <Card className="p-1 border-none shadow-premium bg-white/50 backdrop-blur-sm rounded-2xl">
        <div className="p-4 border-b border-slate-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar por referencia, origen o destino..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white border-slate-200 rounded-xl"
            />
          </div>
        </div>

        <div className="p-2">
          {loading ? (
            <div className="py-20 text-center text-slate-500 animate-pulse flex flex-col items-center">
              <Globe className="h-8 w-8 mb-2 opacity-20" />
              Cargando envíos...
            </div>
          ) : filteredEnvios.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {filteredEnvios.map(envio => (
                <Link key={envio.id} href={`/dashboard/comex/${envio.id}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-xl text-primary mt-1">
                        <PackageOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900">{envio.reference}</h3>
                          <Badge variant="outline" className="uppercase text-[10px] tracking-wider bg-white">
                            {envio.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500 flex items-center gap-1.5">
                          {envio.origin} <ArrowRight className="h-3 w-3" /> {envio.destination}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end mt-4 sm:mt-0 gap-1">
                      <p className="text-sm font-semibold text-slate-700">
                        Valor: ${envio.merchandise_value_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                      </p>
                      <p className="text-xs text-slate-400">
                        {format(new Date(envio.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-slate-500 flex flex-col items-center">
              <Globe className="h-12 w-12 mb-4 text-slate-200" />
              <h3 className="text-lg font-bold text-slate-700">No se encontraron envíos</h3>
              <p className="text-sm max-w-sm mt-1">Crea un nuevo envío para comenzar a gestionar tus importaciones o exportaciones.</p>
            </div>
          )}
        </div>
      </Card>

      <NewEnvioDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        onSuccess={fetchEnvios}
      />
    </div>
  );
}
