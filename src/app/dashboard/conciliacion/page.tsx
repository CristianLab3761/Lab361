import { Metadata } from 'next';
import { ConciliacionTable } from '@/components/app/compras/conciliacion-table';

export const metadata: Metadata = {
  title: 'Conciliación de Compras',
  description: 'Cruce de órdenes de compra con recepciones',
};

export default function ConciliacionPage() {
  return (
    <div className="flex flex-col gap-6 p-6 h-[calc(100vh-theme(spacing.16))]">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Conciliación de Compras</h1>
        <p className="text-muted-foreground">
          Revisa el estado de las órdenes de compra cruzadas con las recepciones de bodega.
        </p>
      </div>

      <div className="flex-1 overflow-auto">
        <ConciliacionTable />
      </div>
    </div>
  );
}
