'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useAppContext, AdminItemType } from '@/context/app-context';
import { AdminDataTable } from '@/components/app/admin-data-table';

export default function AdminCatalogPage() {
  const params = useParams();
  const catalog = params.catalog as string;
  const { proveedores, cuentas, presupuestos, centrosNegocios, centrosCostos } = useAppContext();

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
