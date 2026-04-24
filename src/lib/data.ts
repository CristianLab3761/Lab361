import type { User, Solicitud, OrdenCompra, Proveedor, Cuenta, Presupuesto, CentroNegocios, CentroCostos } from '@/lib/types';
import { subDays, formatISO } from 'date-fns';

export const users: User[] = [
  {
    id: 'user-1',
    name: 'Ana García',
    email: 'ana.garcia@example.com',
    role: 'solicitante',
    avatar: 'https://avatar.vercel.sh/ana.png',
  },
  {
    id: 'user-2',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@example.com',
    role: 'compras',
    avatar: 'https://avatar.vercel.sh/carlos.png',
  },
  {
    id: 'user-3',
    name: 'Luisa Fernández',
    email: 'luisa.fernandez@example.com',
    role: 'solicitante',
    avatar: 'https://avatar.vercel.sh/luisa.png',
  },
];

export const solicitudes: Solicitud[] = [
  {
    id: 'req-001',
    solicitanteId: 'user-1',
    solicitanteName: 'Ana García',
    department: 'Marketing',
    createdAt: formatISO(subDays(new Date(), 2)),
    status: 'vigente',
    items: [
      { id: 'item-1', name: 'Laptop Pro 16"', codigoMaterial: 'LP-16', quantity: 2, estimatedCost: 2500, descripcion: 'Laptop para diseño', cuentaPresupuesto: 'IT-Equipos' },
      { id: 'item-2', name: 'Monitor 4K 27"', codigoMaterial: 'MO-27', quantity: 2, estimatedCost: 700, descripcion: 'Monitor secundario', cuentaPresupuesto: 'IT-Equipos' },
    ],
    totalEstimatedCost: 6400,
  },
  {
    id: 'req-002',
    solicitanteId: 'user-3',
    solicitanteName: 'Luisa Fernández',
    department: 'IT',
    createdAt: formatISO(subDays(new Date(), 5)),
    status: 'vigente',
    items: [
      { id: 'item-3', name: 'Silla Ergonómica', codigoMaterial: 'SE-01', quantity: 10, estimatedCost: 350, descripcion: 'Sillas para la nueva oficina' },
      { id: 'item-4', name: 'Escritorio Ajustable', codigoMaterial: 'EA-01', quantity: 10, estimatedCost: 500, descripcion: 'Escritorios modulares' },
    ],
    totalEstimatedCost: 8500,
  },
  {
    id: 'req-003',
    solicitanteId: 'user-1',
    solicitanteName: 'Ana García',
    department: 'Marketing',
    createdAt: formatISO(subDays(new Date(), 10)),
    status: 'aprobada',
    "Fecha Estatus": formatISO(subDays(new Date(), 9)),
    items: [{ id: 'item-5', name: 'Licencia de Software Creativo (Anual)', quantity: 5, estimatedCost: 600 }],
    totalEstimatedCost: 3000,
  },
  {
    id: 'req-004',
    solicitanteId: 'user-3',
    solicitanteName: 'Luisa Fernández',
    department: 'IT',
    createdAt: formatISO(subDays(new Date(), 15)),
    status: 'procesada',
    "Fecha Estatus": formatISO(subDays(new Date(), 14)),
    "Ref OC": 'oc-001',
    items: [{ id: 'item-6', name: 'Servidor Rackeable', quantity: 1, estimatedCost: 5000 }],
    totalEstimatedCost: 5000,
  },
    {
    id: 'req-005',
    solicitanteId: 'user-1',
    solicitanteName: 'Ana García',
    department: 'Marketing',
    createdAt: formatISO(subDays(new Date(), 20)),
    status: 'rechazada',
    "Fecha Estatus": formatISO(subDays(new Date(), 19)),
    items: [{ id: 'item-7', name: 'Campaña en Redes Sociales', quantity: 1, estimatedCost: 10000 }],
    totalEstimatedCost: 10000,
    comments: "Presupuesto excede el límite trimestral."
  },
];

export const ordenesCompra: OrdenCompra[] = [
  {
    id: 'oc-001',
    solicitudId: 'req-004',
    createdAt: formatISO(subDays(new Date(), 14)),
    supplierName: 'Global Electronics',
    paymentTerms: 'Net 60',
    deliveryInstructions: 'Contact finance upon delivery.',
    poDescription: 'Annual hardware upgrade for IT department.',
    items: [{ id: 'item-6', name: 'Servidor Rackeable', quantity: 1, unitCost: 4850 }],
    totalCost: 4850,
  },
];

// Admin data is now managed in Firestore, so we can clear these initial mock arrays.
export const proveedores: Proveedor[] = [];
export const cuentas: Cuenta[] = [];
export const presupuestos: Presupuesto[] = [];
export const centrosNegocios: CentroNegocios[] = [];
export const centrosCostos: CentroCostos[] = [];
