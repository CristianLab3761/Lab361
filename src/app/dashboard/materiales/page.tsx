'use client';

import React from 'react';
import { useAppContext } from '@/context/app-context';
import { AdminDataTable } from '@/components/app/admin-data-table';
import { MaterialCreateDialog } from '@/components/app/material-create-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, FolderTree, LayoutGrid } from 'lucide-react';
import { PageHeader } from '@/components/app/page-header';

export default function MaterialesPage() {
  const { materialesV04, familias, isLoading } = useAppContext();

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      <PageHeader 
        title="Maestro de Materiales" 
        description="Gestión centralizada del catálogo de productos y reglas de codificación."
      />

      <Tabs defaultValue="catalogo" className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
          <TabsList className="bg-slate-50 border border-slate-200 p-1 rounded-2xl h-12">
            <TabsTrigger value="catalogo" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm font-bold uppercase text-[10px] tracking-widest">
              <Package className="mr-2 h-4 w-4" /> Catálogo
            </TabsTrigger>
            <TabsTrigger value="familias" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm font-bold uppercase text-[10px] tracking-widest">
              <FolderTree className="mr-2 h-4 w-4" /> Familias y Prefijos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="catalogo" className="m-0 border-0 p-0 shadow-none bg-transparent">
            <MaterialCreateDialog />
          </TabsContent>
        </div>

        <TabsContent value="catalogo" className="mt-0 border-0 p-0 shadow-none bg-transparent outline-none">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <AdminDataTable
              title="Lista de Productos"
              description="Catálogo oficial de Botanical Solutions."
              itemType="lista_de_materiales_V04"
              items={materialesV04 || []}
              columns={[
                { key: 'Código', header: 'Código' },
                { key: 'Descripcion del material', header: 'Descripción' },
                { key: 'Clase de Material', header: 'Familia' },
                { key: 'MP/CIF', header: 'SubFamilia' }
              ]}
              formFields={[
                { key: 'Código', placeholder: 'Código' },
                { key: 'Descripcion del material', placeholder: 'Descripción Detallada' },
                { key: 'Clase de Material', placeholder: 'Familia' },
                { key: 'MP/CIF', placeholder: 'SubFamilia' }
              ]}
            />
          </div>
        </TabsContent>

        <TabsContent value="familias" className="mt-0 border-0 p-0 shadow-none bg-transparent outline-none">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <AdminDataTable
              title="Clasificaciones"
              description="Defina los prefijos que se usarán para la generación automática de códigos."
              itemType="familias_materiales"
              items={familias || []}
              columns={[
                { key: 'nombre', header: 'Nombre de Familia' },
                { key: 'prefijo', header: 'Prefijo (Código)' }
              ]}
              formFields={[
                { key: 'nombre', placeholder: 'Nombre de la Familia' },
                { key: 'prefijo', placeholder: 'Prefijo (Ej: HER, REP)' }
              ]}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
