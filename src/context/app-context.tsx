'use client';

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { User, Solicitud, OrdenCompra, Item, Proveedor, Cuenta, Presupuesto, CentroNegocios, CentroCostos } from '@/lib/types';
import {
  users,
  solicitudes as initialSolicitudes,
  ordenesCompra as initialOrdenes,
} from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, addDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
  proveedores: (Proveedor & { id: string })[];
  cuentas: (Cuenta & { id: string })[];
  presupuestos: (Presupuesto & { id: string })[];
  centrosNegocios: (CentroNegocios & { id: string })[];
  centrosCostos: (CentroCostos & { id: string })[];
  addAdminItem: <T extends {}>(itemType: AdminItemType, newItem: T) => Promise<void>;
  addMultipleAdminItems: <T extends {}>(itemType: AdminItemType, newItems: T[]) => Promise<void>;
  removeAdminItem: (itemType: AdminItemType, itemId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(users[1]); // Default to 'compras' user
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>(initialSolicitudes);
  const [ordenesCompra, setOrdenesCompra] = useState<OrdenCompra[]>(initialOrdenes);
  const { toast } = useToast();
  const firestore = useFirestore();

  // Admin state from Firestore
  const proveedoresRef = useMemoFirebase(() => firestore ? collection(firestore, 'proveedores') : null, [firestore]);
  const cuentasRef = useMemoFirebase(() => firestore ? collection(firestore, 'cuentas') : null, [firestore]);
  const presupuestosRef = useMemoFirebase(() => firestore ? collection(firestore, 'presupuestos') : null, [firestore]);
  const centrosNegociosRef = useMemoFirebase(() => firestore ? collection(firestore, 'centrosNegocios') : null, [firestore]);
  const centrosCostosRef = useMemoFirebase(() => firestore ? collection(firestore, 'centrosCostos') : null, [firestore]);

  const { data: proveedores } = useCollection(proveedoresRef);
  const { data: cuentas } = useCollection(cuentasRef);
  const { data: presupuestos } = useCollection(presupuestosRef);
  const { data: centrosNegocios } = useCollection(centrosNegociosRef);
  const { data: centrosCostos } = useCollection(centrosCostosRef);

  const addAdminItem = useCallback(async <T extends {}>(itemType: AdminItemType, newItemData: T) => {
    if (!firestore) return;
    const collectionRef = collection(firestore, itemType);
    
    addDoc(collectionRef, newItemData).catch((serverError: any) => {
        const permissionError = new FirestorePermissionError({
            path: collectionRef.path,
            operation: 'create',
            requestResourceData: newItemData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });

  }, [firestore]);


  const addMultipleAdminItems = useCallback(async <T extends {}>(itemType: AdminItemType, newItemsData: T[]) => {
    if (!firestore) return;

    const collectionRef = collection(firestore, itemType);
    const batch = writeBatch(firestore);
    newItemsData.forEach((itemData) => {
        const docRef = doc(collectionRef); // new doc with random ID
        batch.set(docRef, itemData);
    });

    batch.commit().then(() => {
        toast({
            title: "Importación Exitosa",
            description: `${newItemsData.length} elemento(s) ha(n) sido agregado(s) a ${itemType}.`,
        });
    }).catch((serverError: any) => {
        const permissionError = new FirestorePermissionError({
            path: `/${itemType}`,
            operation: 'write',
            requestResourceData: { itemCount: newItemsData.length },
        });
        errorEmitter.emit('permission-error', permissionError);
    });
}, [firestore, toast]);


  const removeAdminItem = useCallback(async (itemType: AdminItemType, itemId: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, itemType, itemId);
    deleteDoc(docRef).catch((serverError: any) => {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }, [firestore]);

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
    proveedores: proveedores || [],
    cuentas: cuentas || [],
    presupuestos: presupuestos || [],
    centrosNegocios: centrosNegocios || [],
    centrosCostos: centrosCostos || [],
    addAdminItem,
    removeAdminItem,
    addMultipleAdminItems,
  }), [currentUser, users, solicitudes, updateSolicitud, addSolicitud, ordenesCompra, addOrdenCompra, getHistoricalDataForItems, proveedores, cuentas, presupuestos, centrosNegocios, centrosCostos, addAdminItem, removeAdminItem, addMultipleAdminItems]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
