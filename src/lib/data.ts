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
    status: 'pendiente',
    items: [
      { id: 'item-1', name: 'Laptop Pro 16"', quantity: 2, estimatedCost: 2500 },
      { id: 'item-2', name: 'Monitor 4K 27"', quantity: 2, estimatedCost: 700 },
    ],
    totalEstimatedCost: 6400,
  },
  {
    id: 'req-002',
    solicitanteId: 'user-3',
    solicitanteName: 'Luisa Fernández',
    department: 'IT',
    createdAt: formatISO(subDays(new Date(), 5)),
    status: 'pendiente',
    items: [
      { id: 'item-3', name: 'Silla Ergonómica', quantity: 10, estimatedCost: 350 },
      { id: 'item-4', name: 'Escritorio Ajustable', quantity: 10, estimatedCost: 500 },
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

export const proveedores: Proveedor[] = [
    { id: 'prov-1', name: 'Tech Supplies Inc.' },
    { id: 'prov-2', name: 'Office Depot' },
    { id: 'prov-3', name: 'Global Electronics' },
];

export const cuentas: Cuenta[] = [
    { id: 'cta-1', name: 'Suministros de Oficina', code: '601' },
    { id: 'cta-2', name: 'Hardware y Equipo', code: '602' },
    { id: 'cta-3', name: 'Software y Licencias', code: '603' },
];

export const presupuestos: Presupuesto[] = [
    { id: 'pres-1', name: 'Presupuesto Marketing Q3', monto: 50000 },
    { id: 'pres-2', name: 'Presupuesto IT H2', monto: 150000 },
    { id: 'pres-3', name: 'Presupuesto General Oficina', monto: 25000 },
];

export const centrosNegocios: CentroNegocios[] = [
    { id: 'cn-1', name: 'Oficina Central' },
    { id: 'cn-2', name: 'Sucursal Norte' },
];

export const centrosCostos: CentroCostos[] = [
    { id: 'cc-1', name: 'Departamento de Marketing', code: 'MKT' },
    { id: 'cc-2', name: 'Departamento de IT', code: 'IT' },
    { id: 'cc-3', name: 'Administración General', code: 'ADMIN' },
];
