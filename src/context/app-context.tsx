'use client';

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { User, Solicitud, OrdenCompra, Item, Proveedor, Cuenta, Presupuesto, CentroNegocios, CentroCostos } from '@/lib/types';
import {
  users,
  solicitudes as initialSolicitudes,
  ordenesCompra as initialOrdenes,
  proveedores as initialProveedores,
  cuentas as initialCuentas,
  presupuestos as initialPresupuestos,
  centrosNegocios as initialCentrosNegocios,
  centrosCostos as initialCentrosCostos,
} from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

export type AdminItemType = 'proveedores' | 'cuentas' | 'presupuestos' | 'centrosNegocios' | 'centrosCostos';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  solicitudes: Solicitud[];
  updateSolicitud: (id: string, updates: Partial<Solicitud>) => void;
  addSolicitud: (newSolicitud: Omit<Solicitud, 'id' | 'createdAt' | 'solicitanteId' | 'solicitanteName'>) => void;
  ordenesCompra: OrdenCompra[];
  addOrdenCompra: (newOrden: Omit<OrdenCompra, 'id' | 'createdAt'>, solicitudId: string) => void;
  getHistoricalDataForItems: (items: Item[]) => { name: string; averageCost: number }[];

  // Admin data
  proveedores: Proveedor[];
  cuentas: Cuenta[];
  presupuestos: Presupuesto[];
  centrosNegocios: CentroNegocios[];
  centrosCostos: CentroCostos[];
  addAdminItem: <T extends { id: string }>(itemType: AdminItemType, newItem: Omit<T, 'id'>) => void;
  removeAdminItem: (itemType: AdminItemType, itemId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(users[1]); // Default to 'compras' user
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>(initialSolicitudes);
  const [ordenesCompra, setOrdenesCompra] = useState<OrdenCompra[]>(initialOrdenes);
  const { toast } = useToast();

  // Admin state
  const [proveedores, setProveedores] = useState<Proveedor[]>(initialProveedores);
  const [cuentas, setCuentas] = useState<Cuenta[]>(initialCuentas);
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>(initialPresupuestos);
  const [centrosNegocios, setCentrosNegocios] = useState<CentroNegocios[]>(initialCentrosNegocios);
  const [centrosCostos, setCentrosCostos] = useState<CentroCostos[]>(initialCentrosCostos);
  
  const adminStateSetters = useMemo(() => ({
    proveedores: setProveedores,
    cuentas: setCuentas,
    presupuestos: setPresupuestos,
    centrosNegocios: setCentrosNegocios,
    centrosCostos: setCentrosCostos,
  }), []);

  const addAdminItem = useCallback(<T extends { id: string }>(itemType: AdminItemType, newItemData: Omit<T, 'id'>) => {
    const setter = adminStateSetters[itemType] as React.Dispatch<React.SetStateAction<T[]>>;
    const prefix = itemType.slice(0, 4);
    
    setter((prev: T[]) => {
      const newItem = {
        ...newItemData,
        id: `${prefix}-${prev.length + 1 + Math.random()}`,
      } as T;
      return [newItem, ...prev];
    });

    toast({
      title: "Elemento Agregado",
      description: `El nuevo elemento ha sido agregado.`,
    });
  }, [adminStateSetters, toast]);

  const removeAdminItem = useCallback((itemType: AdminItemType, itemId: string) => {
    const setter = adminStateSetters[itemType];
    setter((prev: { id: string }[]) => prev.filter(item => item.id !== itemId));
    toast({
      title: "Elemento Eliminado",
      description: `El elemento ha sido eliminado.`,
    });
  }, [adminStateSetters, toast]);


  const updateSolicitud = useCallback((id: string, updates: Partial<Solicitud>) => {
    setSolicitudes(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updates } : s))
    );
  }, []);

  const addSolicitud = useCallback((newSolicitudData: Omit<Solicitud, 'id' | 'createdAt' | 'solicitanteId' | 'solicitanteName'>) => {
    const newSolicitud: Solicitud = {
      ...newSolicitudData,
      id: `req-${String(solicitudes.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      solicitanteId: currentUser.id,
      solicitanteName: currentUser.name,
    };
    setSolicitudes(prev => [newSolicitud, ...prev]);
    toast({
      title: "Solicitud Creada",
      description: "Tu solicitud de compra ha sido enviada con éxito.",
    });
  }, [currentUser, solicitudes.length, toast]);

  const addOrdenCompra = useCallback((newOrdenData: Omit<OrdenCompra, 'id' | 'createdAt'>, solicitudId: string) => {
    const newOrden: OrdenCompra = {
      ...newOrdenData,
      id: `oc-${String(ordenesCompra.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
    };
    setOrdenesCompra(prev => [newOrden, ...prev]);
    updateSolicitud(solicitudId, { status: 'procesada' });
    toast({
      title: "Orden de Compra Generada",
      description: `La OC ${newOrden.id} ha sido creada y la solicitud ${solicitudId} marcada como procesada.`,
    });
  }, [ordenesCompra.length, updateSolicitud, toast]);

  const getHistoricalDataForItems = useCallback((itemsToCompare: Item[]) => {
    const historicalItems: { [key: string]: { totalCost: number, count: number } } = {};

    [...solicitudes, ...ordenesCompra.map(oc => {
        const originalSolicitud = solicitudes.find(s => s.id === oc.solicitudId);
        return {
            ...originalSolicitud,
            items: oc.items.map(item => ({...item, estimatedCost: item.unitCost}))
        } as Solicitud;
    })].filter(Boolean).forEach(s => {
        if(s.status === 'procesada' || s.status === 'aprobada'){
            s.items.forEach(item => {
                if(!historicalItems[item.name]){
                    historicalItems[item.name] = { totalCost: 0, count: 0 };
                }
                historicalItems[item.name].totalCost += item.estimatedCost;
                historicalItems[item.name].count += item.quantity;
            });
        }
    });

    return itemsToCompare.map(item => {
        const history = historicalItems[item.name];
        return {
            name: item.name,
            averageCost: history ? history.totalCost / history.count : 0,
        };
    }).filter(d => d.averageCost > 0);
  }, [solicitudes, ordenesCompra]);

  const value = useMemo(() => ({
    currentUser,
    setCurrentUser,
    users,
    solicitudes,
    updateSolicitud,
    addSolicitud,
    ordenesCompra,
    addOrdenCompra,
    getHistoricalDataForItems,
    proveedores,
    cuentas,
    presupuestos,
    centrosNegocios,
    centrosCostos,
    addAdminItem,
    removeAdminItem,
  }), [currentUser, users, solicitudes, updateSolicitud, addSolicitud, ordenesCompra, addOrdenCompra, getHistoricalDataForItems, proveedores, cuentas, presupuestos, centrosNegocios, centrosCostos, addAdminItem, removeAdminItem]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
