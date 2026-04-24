'use client';

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { User, Solicitud, OrdenCompra, Item, Proveedor, Cuenta, Presupuesto, CentroNegocios, CentroCostos, Material } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  solicitudes as initialSolicitudes,
  ordenesCompra as initialOrdenes,
} from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth, useSupabaseCollection } from '@/hooks/use-supabase';

export type AdminItemType = 'Proveedores' | 'CuentasPresupuestos' | 'presupuestos' | 'CentrosDeNegocios' | 'centrosCostos' | 'ListaDeMateriales' | 'Requisiciones';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isLoading: boolean;
  users: User[];
  solicitudes: Solicitud[];
  updateSolicitud: (id: string, updates: Partial<Solicitud>) => void;
  toggleFavorite: (id: string, currentStatus: boolean) => Promise<void>;
  addSolicitud: (newSolicitud: Omit<Solicitud, 'id' | 'createdAt' | 'solicitanteId' | 'solicitanteName'>) => void;
  ordenesCompra: OrdenCompra[];
  addOrdenCompra: (newOrden: Omit<OrdenCompra, 'id' | 'createdAt' | 'dia' | 'mes' | 'nMes' | 'anio' | 'semana' | 'estatus'>, solicitudId: string) => void;
  getHistoricalDataForItems: (items: Item[]) => { name: string; averageCost: number }[];

  // Admin data
  proveedores: (Proveedor & { id: string })[];
  cuentas: (Cuenta & { id: string })[];
  presupuestos: (Presupuesto & { id: string })[];
  centrosNegocios: (CentroNegocios & { id: string })[];
  centrosCostos: (CentroCostos & { id: string })[];
  materiales: (Material & { id: string })[];
  addAdminItem: <T extends {}>(itemType: AdminItemType, newItem: T) => Promise<void>;
  addMultipleAdminItems: <T extends {}>(itemType: AdminItemType, newItems: T[]) => Promise<void>;
  updateAdminItem: (itemType: AdminItemType, itemId: string, updates: Partial<any>) => Promise<void>;
  removeAdminItem: (itemType: AdminItemType, itemId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>(initialSolicitudes);
  const [ordenesCompra, setOrdenesCompra] = useState<OrdenCompra[]>(initialOrdenes);
  const { toast } = useToast();

  const { user: supabaseUser, loading: authLoading } = useSupabaseAuth();
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    async function fetchUserProfile() {
      if (authLoading) return;
      
      if (!supabaseUser) {
        setCurrentUser(null);
        setIsProfileLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .single();

        if (data && !error) {
          setCurrentUser({
            id: supabaseUser.id,
            name: data.displayName || data.name || 'Unknown',
            email: data.email || supabaseUser.email || '',
            role: data.role || 'solicitante',
            department: data.department || '',
            cargo: data.cargo || '',
            centroCostos: data.centro_costos || '',
            centroNegocios: data.centro_negocios || '',
            createdAt: data.createdAt,
          });
        } else {
          console.warn('UserProfile not found in Supabase for id:', supabaseUser.id);
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setCurrentUser(null);
      }
      setIsProfileLoading(false);
    }

    fetchUserProfile();
  }, [supabaseUser, authLoading]);

  const combinedIsLoading = authLoading || isProfileLoading;

  const handleSetCurrentUser = useCallback((user: User | null) => {
    setCurrentUser(user);
  }, []);

  // Admin state from Supabase
  const isUserAuthenticated = !!supabaseUser;
  
  // Cleaned up: only fetch Requisiciones to avoid 404 errors on missing tables
  // Actualizado a la versión V05 (Modelo Eficiente JSONB)
  const { data: dbSolicitudes, error: fetchError, isLoading: isFetching } = useSupabaseCollection(isUserAuthenticated ? 'RequisicionesV05' : null);
  
  if (fetchError) {
    console.error("Error al cargar Requisiciones de Supabase:", fetchError);
  }

  const { data: dbMateriales } = useSupabaseCollection(isUserAuthenticated ? 'ListaDeMateriales' : null);
  const { data: dbProveedores } = useSupabaseCollection(isUserAuthenticated ? 'Proveedores' : null);
  const { data: dbOrdenes } = useSupabaseCollection(isUserAuthenticated ? 'PurchaseOrdersV05' : null);
  const { data: dbCentrosCostos } = useSupabaseCollection(isUserAuthenticated ? 'centrosCostos' : null);
  const { data: dbCentrosNegocios } = useSupabaseCollection(isUserAuthenticated ? 'CentrosDeNegocios' : null);

  const proveedores: any[] = dbProveedores || [];
  const cuentas: any[] = [];
  const presupuestos: any[] = [];
  const centrosNegocios: any[] = dbCentrosNegocios || [];
  const centrosCostos: any[] = dbCentrosCostos || [];
  const materiales: any[] = dbMateriales || [];

  // Sync local solicitudes with DB ones
  useEffect(() => {
    if (dbSolicitudes) {
      console.log(`Procesando ${dbSolicitudes.length} requisiciones de la base de datos.`);
      
      const normalizedData: Solicitud[] = dbSolicitudes.map((s: any) => {
        // En V05 los ítems están en la columna Items_JSON
        const rowItems = s.Items_JSON || [];

        // Mapeo estándar para satisfacer el tipo Solicitud
        return {
          ...s,
          moneda: s.Moneda || 'CLP',
          id: String(s["N° Requisición"] || s.id || ""),
          createdAt: s["Fecha"] || s.created_at || new Date().toISOString(),
          solicitanteName: s["Solicitante"] || "Sin nombre",
          proveedor: s["Proveedor"] || "No especificado",
          totalEstimatedCost: parseFloat(String(s["Total_Global"] || s.Total || "0")),
          totalNeto: parseFloat(String(s["Total_Neto"] || "0")),
          totalIva: parseFloat(String(s["Total_IVA"] || "0")),
          totalGlobal: parseFloat(String(s["Total_Global"] || "0")),
          status: (() => {
            const rawStatus = String(s["Estatus"] || "vigente").toLowerCase().trim();
            return rawStatus === 'pendiente' ? 'vigente' : rawStatus;
          })(),
          isFavorite: s.Es_Favorita || false,
          items: (rowItems || []).map((item: any, idx: number) => ({
            id: item.id || `item-${idx}`,
            name: String(item.descripcion || item.name || 'Sin nombre'),
            quantity: parseFloat(String(item.unidades || item.quantity)) || 1,
            estimatedCost: parseFloat(String(item.precio_unitario || item.estimatedCost)) || 0,
            codigoMaterial: item.codigo_material || item.codigoMaterial || '',
            descripcion: item.descripcion || '',
            nroItem: item.nro_item || (idx + 1),
            montoNeto: item.monto_neto || 0,
            montoTotalIva: item.monto_total_iva || 0
          })),
          department: s["Cargo"] || "",
          comments: s.comments || "",
          "N° Requisición": s["N° Requisición"] || s.id || "",
          "Fecha": s["Fecha"] || s.fecha || "",
          "Hora": s["Hora"] || s.hora || "",
          "Solicitante": s["Solicitante"] || s.solicitante || "",
          "Cargo": s["Cargo"] || s.cargo || "",
          "Centro de Costos": s["Centro de Costos"] || s.centro_costos || "",
          "Centro de Negocios": s["Centro de Negocios"] || s.centro_negocios || "",
          "Proveedor": s["Proveedor"] || s.proveedor || "",
          "Autorizado por": s["Autorizado por"] || s.autorizado_por || "",
          "Estatus": s["Estatus"] || s.estatus || "vigente",
          "Fecha Estatus": s["Fecha Estatus"] || s.fecha_estatus || "",
          "Ref OC": s["Ref OC"] || s.ref_oc || "",
          solicitanteId: s.solicitanteId || s.solicitanteid || s.requesterId || s.requesterid || ""
        } as Solicitud;
      });

      console.log(`Normalizadas ${normalizedData.length} requisiciones únicas.`);
      setSolicitudes(normalizedData);
    }
  }, [dbSolicitudes]);

  useEffect(() => {
    if (dbOrdenes) {
      setOrdenesCompra(dbOrdenes as any);
    }
  }, [dbOrdenes]);



  const addAdminItem = useCallback(async <T extends {}>(itemType: AdminItemType, newItemData: T) => {
    const { error } = await supabase.from(itemType).insert([newItemData]);
    if (error) {
      console.error(`Error adding to ${itemType}:`, error);
      toast({
        variant: 'destructive',
        title: "Error al agregar elemento",
        description: error.message,
      });
    }
  }, [toast]);

  const addMultipleAdminItems = useCallback(async <T extends {}>(itemType: AdminItemType, newItemsData: T[]) => {
    const { error } = await supabase.from(itemType).insert(newItemsData);
    if (error) {
      console.error(`Error importing to ${itemType}:`, error);
      toast({
        variant: 'destructive',
        title: "Error en la importación",
        description: error.message,
      });
    } else {
      toast({
        title: "Importación Exitosa",
        description: `${newItemsData.length} elemento(s) ha(n) sido agregado(s) a ${itemType}.`,
      });
    }
  }, [toast]);

  const removeAdminItem = useCallback(async (itemType: AdminItemType, itemId: string) => {
    const { error } = await supabase.from(itemType).delete().eq('id', itemId);
    if (error) {
      console.error(`Error removing from ${itemType}:`, error);
      toast({
        variant: 'destructive',
        title: "Error al eliminar",
        description: error.message,
      });
    }
  }, [toast]);

  const updateAdminItem = useCallback(async (itemType: AdminItemType, itemId: string, updates: Partial<any>) => {
    const { error } = await supabase.from(itemType).update(updates).eq('id', itemId);
    if (error) {
      console.error(`Error updating ${itemType}:`, error);
      toast({
        variant: 'destructive',
        title: "Error al actualizar",
        description: error.message,
      });
    }
  }, [toast]);

  const updateSolicitud = useCallback(async (id: string, updates: Partial<Solicitud>) => {
    // Map internal fields to Spanish columns for DB write
    const dbUpdates: any = { ...updates };
    if (updates.status) dbUpdates["Estatus"] = updates.status;
    if (updates.id) dbUpdates["N° Requisición"] = updates.id;
    if (updates.createdAt) dbUpdates["Fecha"] = updates.createdAt;
    
    // Remove internal fields that shouldn't be in DB directly or were already mapped
    delete dbUpdates.id;
    delete dbUpdates.status;
    delete dbUpdates.createdAt;
    delete dbUpdates.solicitanteName;
    delete dbUpdates.totalEstimatedCost;

    const { error } = await supabase.from('RequisicionesV05').update(dbUpdates).eq('N° Requisición', id);
    if (error) {
      console.error('Error updating solicitud:', error);
    }
  }, []);

  const toggleFavorite = useCallback(async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('RequisicionesV05')
      .update({ "Es_Favorita": !currentStatus })
      .eq('N° Requisición', id);

    if (error) {
      console.error('Error toggling favorite:', error);
      toast({
        variant: 'destructive',
        title: "Error al actualizar favorito",
        description: error.message,
      });
    }
  }, [toast]);

  const addSolicitud = useCallback(async (newSolicitudData: Partial<Solicitud>) => {
    if (!currentUser) {
      toast({
        variant: 'destructive',
        title: "No autenticado",
        description: "Debes iniciar sesión para crear una requisición.",
      });
      return;
    }
    
    const reqId = newSolicitudData.id || `REQ-${String(solicitudes.length + 1).padStart(4, '0')}`;
    
    // Preparar ítems para formato JSONB de V05
    const isAfecto = newSolicitudData.isAfectoIVA !== false; // Default true if undefined
    
    const jsonItems = (newSolicitudData.items || []).map((item, idx) => {
      const neto = (item.quantity || 0) * (item.estimatedCost || 0);
      return {
        nro_item: idx + 1,
        codigo_material: item.codigoMaterial || '',
        descripcion: item.name || '',
        unidades: item.quantity || 0,
        precio_unitario: item.estimatedCost || 0,
        monto_neto: neto,
        monto_total_iva: isAfecto ? Math.round(neto * 1.19) : neto
      };
    });

    const totalNeto = jsonItems.reduce((acc, curr) => acc + curr.monto_neto, 0);
    const totalGlobal = jsonItems.reduce((acc, curr) => acc + curr.monto_total_iva, 0);
    
    // Create the object with exact Spanish keys for DB V05
    const dbSolicitud: any = {
      "solicitanteId": currentUser.id,
      "N° Requisición": reqId,
      "Fecha": newSolicitudData.createdAt || format(new Date(), 'yyyy-MM-dd'),
      "Hora": format(new Date(), 'HH:mm'),
      "Solicitante": newSolicitudData.solicitanteName || currentUser.name,
      "Cargo": newSolicitudData.cargo || currentUser.cargo || '',
      "Centro de Costos": newSolicitudData.centroCostos || currentUser.centroCostos || '',
      "Centro de Negocios": newSolicitudData.centroNegocios || currentUser.centroNegocios || '',
      "Proveedor": newSolicitudData.proveedor || '',
      "Estatus": newSolicitudData.status === 'pendiente' ? 'vigente' : (newSolicitudData.status || 'vigente'),
      "Fecha Estatus": new Date().toISOString(),
      "Total_Neto": totalNeto,
      "Total_IVA": totalGlobal - totalNeto,
      "Total_Global": totalGlobal,
      "totalEstimatedCost": totalGlobal, // Para compatibilidad con PDF y vistas
      "Moneda": newSolicitudData.moneda || 'CLP',
      "Items_JSON": jsonItems
    };
    
    const { error } = await supabase.from('RequisicionesV05').insert([dbSolicitud]);
    if (error) {
      toast({
        variant: 'destructive',
        title: "Error al crear la requisición",
        description: error.message,
      });
    } else {
      toast({
        title: "Requisición Creada",
        description: `Requisición ${reqId} ha sido enviada con éxito.`,
      });
    }
  }, [currentUser, solicitudes.length, toast]);

  const addOrdenCompra = useCallback(async (newOrdenData: Omit<OrdenCompra, 'id' | 'createdAt' | 'dia' | 'mes' | 'nMes' | 'anio' | 'semana' | 'estatus'>, solicitudId: string) => {
    const ocId = `oc-${String(ordenesCompra.length + 1).padStart(3, '0')}`;
    const now = new Date();
    
    // Automatic date breakdown
    const day = now.getDate();
    const monthIndex = now.getMonth() + 1;
    const year = now.getFullYear();
    const monthName = format(now, 'MMMM', { locale: es });
    const weekNumber = parseInt(format(now, 'I')); // ISO Week number

    const newOrden: OrdenCompra = {
      ...newOrdenData,
      id: ocId,
      createdAt: now.toISOString(),
      dia: day,
      mes: monthName,
      nMes: monthIndex,
      anio: year,
      semana: weekNumber,
      estatus: 'completado'
    };

    // Save to Supabase (using V05 naming pattern for consistency if exists, or PurchaseOrders)
    const { error } = await supabase.from('PurchaseOrdersV05').insert([newOrden]);
    
    if (error) {
      console.error('Error al persistir OC en Supabase:', error);
      // Fallback to local state if table doesn't exist yet
    }

    setOrdenesCompra(prev => [newOrden, ...prev]);
    
    // Actualizamos la solicitud a 'procesada' y guardamos la referencia de la OC
    await updateSolicitud(solicitudId, { 
      status: 'procesada',
      "Ref OC": ocId 
    });

    toast({
      title: "Orden de Compra Generada",
      description: `La OC ${ocId} ha sido creada con éxito.`,
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
    setCurrentUser: handleSetCurrentUser,
    isLoading: combinedIsLoading,
    users: [], // Placeholder for user list if needed
    solicitudes,
    updateSolicitud,
    toggleFavorite,
    addSolicitud,
    ordenesCompra,
    addOrdenCompra,
    getHistoricalDataForItems,
    proveedores: proveedores || [],
    cuentas: cuentas || [],
    presupuestos: presupuestos || [],
    centrosNegocios: centrosNegocios || [],
    centrosCostos: centrosCostos || [],
    materiales: materiales || [],
    addAdminItem,
    removeAdminItem,
    updateAdminItem,
    addMultipleAdminItems,
  }), [currentUser, combinedIsLoading, solicitudes, updateSolicitud, addSolicitud, ordenesCompra, addOrdenCompra, getHistoricalDataForItems, proveedores, cuentas, presupuestos, centrosNegocios, centrosCostos, materiales, addAdminItem, removeAdminItem, updateAdminItem, addMultipleAdminItems, handleSetCurrentUser]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
