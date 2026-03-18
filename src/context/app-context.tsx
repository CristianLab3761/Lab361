'use client';

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { User, Solicitud, OrdenCompra, Item } from '@/lib/types';
import { users, solicitudes as initialSolicitudes, ordenesCompra as initialOrdenes } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(users[1]); // Default to 'compras' user
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>(initialSolicitudes);
  const [ordenesCompra, setOrdenesCompra] = useState<OrdenCompra[]>(initialOrdenes);
  const { toast } = useToast();

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
  }), [currentUser, users, solicitudes, updateSolicitud, addSolicitud, ordenesCompra, addOrdenCompra, getHistoricalDataForItems]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
