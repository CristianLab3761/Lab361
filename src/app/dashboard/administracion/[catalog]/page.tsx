'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useAppContext, AdminItemType } from '@/context/app-context';
import { AdminDataTable } from '@/components/app/admin-data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Layers, FolderTree } from 'lucide-react';

export default function AdminCatalogPage() {
  const params = useParams();
  const catalog = params.catalog as string;
  const { proveedores, cuentas, presupuestos, centrosNegocios, centrosCostos, materiales, familias, subfamilias } = useAppContext();

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
                { key: 'Forma de Pago', placeholder: 'Forma de Pago' },
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
        const handleMaterialFieldChange = (name: string, val: any, current: any) => {
          if (name === 'familia' || name === 'subfamilia') {
            const fam = name === 'familia' ? val : current.familia;
            const sub = name === 'subfamilia' ? val : current.subfamilia;
            if (fam && sub) {
              const prefix = `${fam}-${sub}-`;
              const related = materiales.filter(m => m.codigo && m.codigo.startsWith(prefix));
              let nextNum = 1;
              if (related.length > 0) {
                const nums = related.map(m => {
                  const parts = m.codigo.split('-');
                  return parseInt(parts[parts.length - 1]) || 0;
                });
                nextNum = Math.max(...nums) + 1;
              }
              const newCode = `${prefix}${String(nextNum).padStart(3, '0')}`;
              return { ...current, codigo: newCode };
            }
          }
          return current;
        };

        return (
          <div className="space-y-6">
            <Tabs defaultValue="maestro" className="w-full">
              <div className="flex items-center justify-between mb-2">
                <TabsList className="bg-slate-100/70 p-1 h-12 rounded-xl">
                  <TabsTrigger value="maestro" className="rounded-lg px-6 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
                    <Package className="h-4 w-4" /> Maestro de Materiales
                  </TabsTrigger>
                  <TabsTrigger value="familias" className="rounded-lg px-6 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
                    <Layers className="h-4 w-4" /> Familias
                  </TabsTrigger>
                  <TabsTrigger value="subfamilias" className="rounded-lg px-6 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
                    <FolderTree className="h-4 w-4" /> SubFamilias
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="maestro" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <AdminDataTable
                  title="Maestro de Materiales"
                  description="Catálogo completo de productos con codificación técnica."
                  itemType="ListaDeMateriales"
                  items={materiales || []}
                  onFieldChange={handleMaterialFieldChange}
                  columns={[
                    { key: 'codigo', header: 'Código' },
                    { key: 'descripcion', header: 'Descripción' },
                    { key: 'familia', header: 'Familia' },
                    { key: 'subfamilia', header: 'SubFamilia' }
                  ]}
                  formFields={[
                    { key: 'familia', placeholder: '1. Familia', type: 'select', options: familias.map(f => f.codigo) },
                    { key: 'subfamilia', placeholder: '2. SubFamilia', type: 'select', options: subfamilias.map(sf => sf.codigo) },
                    { key: 'codigo', placeholder: 'Código (Autogenerado)' },
                    { key: 'descripcion', placeholder: 'Descripción Detallada' }
                  ]}
                />
              </TabsContent>

              <TabsContent value="familias" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <AdminDataTable
                  title="Familias"
                  description="Categorías generales de materiales."
                  itemType="Familias"
                  items={familias || []}
                  columns={[{ key: 'codigo', header: 'Código' }, { key: 'nombre', header: 'Nombre' }]}
                  formFields={[{ key: 'codigo', placeholder: 'Código (Ej: LIM)' }, { key: 'nombre', placeholder: 'Nombre' }]}
                />
              </TabsContent>

              <TabsContent value="subfamilias" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <AdminDataTable
                  title="SubFamilias"
                  description="Categorías específicas vinculadas a familias."
                  itemType="SubFamilias"
                  items={subfamilias || []}
                  columns={[{ key: 'codigo', header: 'Código' }, { key: 'nombre', header: 'Nombre' }, { key: 'familia', header: 'Familia' }]}
                  formFields={[
                    { key: 'codigo', placeholder: 'Código' }, 
                    { key: 'nombre', placeholder: 'Nombre' },
                    { key: 'familia', placeholder: 'Familia', type: 'select', options: familias.map(f => f.codigo) }
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
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 h-full w-full">
        {renderCatalog()}
    </div>
  );
}
