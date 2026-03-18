'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/context/app-context';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export function OrdersTable() {
  const { ordenesCompra, currentUser } = useAppContext();

  const sortedOrders = React.useMemo(() => {
    return [...ordenesCompra].sort((a, b) => parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime());
  }, [ordenesCompra]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID de OC</TableHead>
          <TableHead>ID de Solicitud</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Proveedor</TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead className="text-right">Costo Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedOrders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">{order.id.toUpperCase()}</TableCell>
            <TableCell>{order.solicitudId.toUpperCase()}</TableCell>
            <TableCell>{format(parseISO(order.createdAt), "dd MMM yyyy", { locale: es })}</TableCell>
            <TableCell>{order.supplierName}</TableCell>
            <TableCell className="max-w-xs truncate">{order.poDescription}</TableCell>
            <TableCell className="text-right">{currencyFormatter.format(order.totalCost)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
