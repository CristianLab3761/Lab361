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

export const solicitudes: Solicitud[] = [];

export const ordenesCompra: OrdenCompra[] = [];

// Admin data is now managed in Firestore, so we can clear these initial mock arrays.
export const proveedores: Proveedor[] = [];
export const cuentas: Cuenta[] = [];
export const presupuestos: Presupuesto[] = [];
export const centrosNegocios: CentroNegocios[] = [];
export const centrosCostos: CentroCostos[] = [];
