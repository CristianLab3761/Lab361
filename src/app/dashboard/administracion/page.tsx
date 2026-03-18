'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { useAppContext, AdminItemType } from '@/context/app-context';
import { Header } from '@/components/app/header';
import { PageHeader } from '@/components/app/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AdminSectionProps<T extends { id: string; name: string; [key: string]: any }> {
  title: string;
  description: string;
  itemType: AdminItemType;
  items: T[];
  columns: { key: keyof T; header: string }[];
  formFields: { key: keyof T, placeholder: string, type?: string }[];
}

function AdminSection<T extends { id: string; name: string; [key: string]: any }>({ title, description, itemType, items, columns, formFields }: AdminSectionProps<T>) {
  const { addAdminItem, removeAdminItem } = useAppContext();
  const [newItem, setNewItem] = useState<Partial<T>>({});
  const [isAdding, setIsAdding] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setNewItem({
      ...newItem,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    });
  };

  const handleAddItem = async () => {
    if (formFields.some(field => !newItem[field.key])) {
      alert('Por favor, complete todos los campos.');
      return;
    }
    setIsAdding(true);
    await addAdminItem(itemType, newItem as Omit<T, 'id'>);
    setNewItem({});
    setIsAdding(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex flex-wrap gap-2">
            {formFields.map(field => (
                 <Input
                    key={String(field.key)}
                    type={field.type || 'text'}
                    name={String(field.key)}
                    placeholder={field.placeholder}
                    value={(newItem[field.key] as string | number) || ''}
                    onChange={handleInputChange}
                    className="flex-1 min-w-[150px]"
                />
            ))}
            <Button onClick={handleAddItem} size="icon" className="shrink-0" disabled={isAdding}>
              {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>

          <ScrollArea className="h-48 rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map(col => <TableHead key={String(col.key)}>{col.header}</TableHead>)}
                  <TableHead className="text-right w-[50px]">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    {columns.map(col => <TableCell key={String(col.key)}>{String(item[col.key])}</TableCell>)}
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => removeAdminItem(itemType, item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}


export default function AdministracionPage() {
  const { currentUser, proveedores, cuentas, presupuestos, centrosNegocios, centrosCostos } = useAppContext();

  if (currentUser.role !== 'compras') {
    return (
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Header breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Administración' }]} />
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-20">
                <div className="flex flex-col items-center gap-1 text-center">
                  <h3 className="text-2xl font-bold tracking-tight">Acceso Restringido</h3>
                  <p className="text-sm text-muted-foreground">
                    Esta sección solo está disponible para el equipo de compras.
                  </p>
                </div>
              </div>
        </main>
    );
  }

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Administración' }]} />
      <PageHeader title="Administración de Datos Maestros" description="Gestiona los datos base para el sistema de compras." />
      
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <AdminSection
          title="Proveedores"
          description="Gestiona la lista de proveedores autorizados."
          itemType="proveedores"
          items={proveedores || []}
          columns={[{ key: 'name', header: 'Nombre' }]}
          formFields={[{ key: 'name', placeholder: 'Nuevo Proveedor' }]}
        />
        <AdminSection
          title="Cuentas Contables"
          description="Gestiona las cuentas para la categorización de gastos."
          itemType="cuentas"
          items={cuentas || []}
          columns={[{ key: 'code', header: 'Código' }, { key: 'name', header: 'Nombre' }]}
          formFields={[{ key: 'name', placeholder: 'Nombre Cuenta' }, { key: 'code', placeholder: 'Código' }]}
        />
         <AdminSection
          title="Presupuestos"
          description="Gestiona los presupuestos disponibles."
          itemType="presupuestos"
          items={presupuestos || []}
          columns={[{ key: 'name', header: 'Nombre' }, { key: 'monto', header: 'Monto' }]}
          formFields={[{ key: 'name', placeholder: 'Nombre Presupuesto' }, { key: 'monto', placeholder: 'Monto', type: 'number' }]}
        />
         <AdminSection
          title="Centros de Negocios"
          description="Gestiona los centros de negocio o sucursales."
          itemType="centrosNegocios"
          items={centrosNegocios || []}
          columns={[{ key: 'name', header: 'Nombre' }]}
          formFields={[{ key: 'name', placeholder: 'Nuevo Centro de Negocio' }]}
        />
        <AdminSection
          title="Centros de Costos"
          description="Gestiona los centros de costos o departamentos."
          itemType="centrosCostos"
          items={centrosCostos || []}
          columns={[{ key: 'code', header: 'Código' }, { key: 'name', header: 'Nombre' }]}
          formFields={[{ key: 'name', placeholder: 'Nombre Centro' }, { key: 'code', placeholder: 'Código' }]}
        />
      </div>
    </main>
  );
}
