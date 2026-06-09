'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useAppContext, AdminItemType } from '@/context/app-context';
import { AdminDataTable } from '@/components/app/admin-data-table';
import { MaterialCreateDialog } from '@/components/app/material-create-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Layers, FolderTree, Search, LayoutGrid } from 'lucide-react';

export default function AdminCatalogPage() {
  const params = useParams();
  const catalog = params.catalog as string;
  const { proveedores, cuentas, presupuestos, centrosNegocios, centrosCostos, materiales, materialesV04, familias } = useAppContext();

  // Mapping configurations
  const renderCatalog = () => {
    switch (catalog) {
      case 'proveedores':
        return (
          <AdminDataTable
            title="Proveedores Autorizados"
            description="Gestiona la base de datos de proveedores, edita razones sociales o elimina registros."
            itemType="Proveedores"
            items={proveedores as any || []}
            columns={[
                { key: 'Nombre de Fantasia', header: 'Nombre Fantasía' },
                { key: 'RAZON SOCIAL', header: 'Razón Social' },
                { key: 'RUT', header: 'RUT' },
                { key: 'Compra Mínima', header: 'Compra Min.' },
                { key: 'Beneficios', header: 'Beneficios' },
                { key: 'lead-time', header: 'Lead Time' },
                { key: 'EMAIL', header: 'Email' }
            ]}
            formFields={[
                { key: 'Nombre de Fantasia', placeholder: 'Nombre Fantasía' },
                { key: 'RAZON SOCIAL', placeholder: 'Razón Social' },
                { key: 'DIRECCION', placeholder: 'Dirección' },
                { key: 'RUT', placeholder: 'RUT' },
                { key: 'lead-time', placeholder: 'Lead Time (Ej: 3-5 días)' },
                { key: 'CIUDAD', placeholder: 'Ciudad' },
                { key: 'PAÌS', placeholder: 'País' },
                { key: 'TELEFONO', placeholder: 'Teléfono' },
                { key: 'EMAIL', placeholder: 'Email' },
                { key: 'Codigo Proveedor', placeholder: 'Código Proveedor' },
                { key: 'NUMERO DE CUENTA', placeholder: 'Número de Cuenta' },
                { key: 'CODIGO DE BANCO', placeholder: 'Código de Banco' },
                { key: 'BANCO', placeholder: 'Banco' },
                { key: 'Compra Mínima', placeholder: 'Compra Mínima (Monto)', type: 'number' },
                { 
                  key: 'Beneficios', 
                  placeholder: 'Beneficios Compra Mínima', 
                  type: 'checkbox-group',
                  options: ['Despacho Gratis', 'Descuento Adicional', 'Prioridad de Entrega', 'Soporte Premium']
                },
                { key: 'OBSERVACIONES', placeholder: 'Observaciones' },
                { 
                  key: 'Forma de Pago', 
                  placeholder: 'Forma de Pago',
                  type: 'select',
                  options: ['Crédito a 60 dias', 'Crédito a 30 dias', 'Anticipo', 'Crédito a 75 dias', 'Crédito a 90 dias']
                },
                { key: 'Vigencia', placeholder: 'Vigencia (Vigente/Inactivo)' },
                { key: 'COMENTARIO', placeholder: 'Comentario' }
            ]}
          />
        );
      case 'cuentas':
        return (
          <AdminDataTable
            title="Cuentas Presupuesto"
            description="Gestiona las cuentas de presupuesto."
            itemType="CuentasPresupuestos"
            items={cuentas || []}
            columns={[{ key: 'code', header: 'Código' }, { key: 'name', header: 'Nombre Cuenta' }]}
            formFields={[{ key: 'name', placeholder: 'Nombre Cuenta' }, { key: 'code', placeholder: 'Código' }]}
          />
        );
      case 'presupuestos':
        return (
          <AdminDataTable
            title="Presupuestos"
            description="Gestiona los fondos disponibles asociados a categorías."
            itemType="presupuestos"
            items={presupuestos || []}
            columns={[{ key: 'name', header: 'Nombre Presupuesto' }, { key: 'monto', header: 'Monto Estimado' }]}
            formFields={[{ key: 'name', placeholder: 'Nombre' }, { key: 'monto', placeholder: 'Monto', type: 'number' }]}
          />
        );
      case 'centros-negocios':
        return (
          <AdminDataTable
            title="Centros de Negocios"
            description="Determina las diferentes líneas comerciales o sucursales de la empresa."
            itemType="CentrosDeNegocios"
            items={centrosNegocios as any || []}
            columns={[{ key: 'name', header: 'Nombre del Centro' }]}
            formFields={[{ key: 'name', placeholder: 'Nuevo Centro de Negocio' }]}
          />
        );
      case 'centros-costos':
        return (
          <AdminDataTable
            title="Centros de Costos"
            description="Divisiones o departamentos dentro de la empresa para asignación financiera."
            itemType="centrosCostos"
            items={centrosCostos || []}
            columns={[{ key: 'code', header: 'Código CC' }, { key: 'name', header: 'Nombre del Centro' }]}
            formFields={[{ key: 'name', placeholder: 'Nombre Centro' }, { key: 'code', placeholder: 'Código' }]}
          />
        );
      case 'usuarios':
        const { users } = useAppContext();
        return (
          <AdminDataTable
            title="Gestión de Usuarios"
            description="Administra los perfiles de usuario, asigna roles (Solicitante, Compras, Autorizador) y departamentos."
            itemType="user_profiles"
            items={users || []}
            columns={[
                { key: 'displayName', header: 'Nombre' },
                { key: 'email', header: 'Email' },
                { key: 'role', header: 'Rol' },
                { key: 'department', header: 'Departamento' }
            ]}
            formFields={[
                { key: 'displayName', placeholder: 'Nombre Completo' },
                { key: 'email', placeholder: 'Correo Electrónico' },
                { 
                  key: 'role', 
                  placeholder: 'Rol del Usuario', 
                  type: 'select',
                  options: ['solicitante', 'compras', 'autorizador']
                },
                { key: 'department', placeholder: 'Departamento' },
                { key: 'cargo', placeholder: 'Cargo/Puesto' },
                { key: 'centro_costos', placeholder: 'Centro de Costos (Opcional)' },
                { key: 'centro_negocios', placeholder: 'Centro de Negocios (Opcional)' }
            ]}
          />
        );
      case 'materiales':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <Tabs defaultValue="catalogo" className="w-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <TabsList className="bg-white border border-slate-200 p-1 rounded-2xl h-12 shadow-sm">
                  <TabsTrigger value="catalogo" className="rounded-xl px-6 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 font-bold uppercase text-[10px] tracking-widest">
                    <Package className="mr-2 h-4 w-4" /> Catálogo
                  </TabsTrigger>
                  <TabsTrigger value="familias" className="rounded-xl px-6 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 font-bold uppercase text-[10px] tracking-widest">
                    <FolderTree className="mr-2 h-4 w-4" /> Clasificación (Familias)
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="catalogo" className="m-0 border-0 p-0 shadow-none bg-transparent">
                  <MaterialCreateDialog />
                </TabsContent>
              </div>

              <TabsContent value="catalogo" className="mt-0 border-0 p-0 shadow-none bg-transparent">
                <AdminDataTable
                  title="Maestro de Materiales"
                  description="Lista completa de materiales registrados en el sistema."
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
              </TabsContent>

              <TabsContent value="familias" className="mt-0 border-0 p-0 shadow-none bg-transparent">
                <AdminDataTable
                  title="Clasificación de Materiales"
                  description="Defina las familias de productos y asigne los prefijos para la codificación automática."
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
              </TabsContent>
            </Tabs>
          </div>
        );
      default:
        return (
            <div className="p-12 text-center text-slate-500">
                Seleccione un catálogo del menú lateral.
            </div>
        );
    }
  };

  return (
    <div className="h-full w-full">
        {renderCatalog()}
    </div>
  );
}
