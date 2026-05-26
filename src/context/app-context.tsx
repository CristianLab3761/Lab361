'use client';

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { User, Solicitud, OrdenCompra, Item, Proveedor, Cuenta, Presupuesto, CentroNegocios, CentroCostos, Material, FamiliaMaterial } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  solicitudes as initialSolicitudes,
  ordenesCompra as initialOrdenes,
} from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth, useSupabaseCollection } from '@/hooks/use-supabase';

export type AdminItemType = 'Proveedores' | 'CuentasPresupuestos' | 'presupuestos' | 'CentrosDeNegocios' | 'centrosCostos' | 'ListaDeMateriales' | 'familias_materiales' | 'Requisiciones' | 'user_profiles' | 'OrdenesCompraV04' | 'OrdenesCompraV05';

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
  ordenesCompraV04: any[];
  ordenesCompraV05: any[];
  dbRequisicionesV04: any[];
  dbOrdenesV04: any[];
  dbOrdenesV05: any[];
  addOrdenCompra: (newOrden: Omit<OrdenCompra, 'id' | 'createdAt' | 'dia' | 'mes' | 'nMes' | 'anio' | 'semana' | 'estatus'>, solicitudId: string) => void;
  getHistoricalDataForItems: (items: Item[]) => { name: string; averageCost: number }[];

  // Admin data
  proveedores: (Proveedor & { id: string })[];
  cuentas: (Cuenta & { id: string })[];
  presupuestos: (Presupuesto & { id: string })[];
  centrosNegocios: (CentroNegocios & { id: string })[];
  centrosCostos: (CentroCostos & { id: string })[];
  materiales: (Material & { id: string })[];
  familias: (FamiliaMaterial & { id: string })[];
  addAdminItem: <T extends {}>(itemType: AdminItemType, newItem: T) => Promise<void>;
  updateAdminItem: (itemType: AdminItemType, itemId: string, updates: Partial<any>) => Promise<void>;
  removeAdminItem: (itemType: AdminItemType, itemId: string) => Promise<void>;
  addMultipleAdminItems: <T extends {}>(itemType: AdminItemType, newItemsData: T[]) => Promise<void>;
  logout: () => Promise<void>;
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

    // When supabaseUser changes (e.g. after login), reset loading to prevent
    // the dashboard from redirecting to /login before the profile is fetched.
    if (!authLoading && supabaseUser) {
      setIsProfileLoading(true);
    }

    fetchUserProfile();
  }, [supabaseUser, authLoading]);

  const combinedIsLoading = authLoading || isProfileLoading;

  const handleSetCurrentUser = useCallback((user: User | null) => {
    setCurrentUser(user);
  }, []);

  // Admin state from Supabase
  const isUserAuthenticated = !!supabaseUser && !authLoading;
  
  // Cleaned up: only fetch Requisiciones to avoid 404 errors on missing tables
  // Actualizado a la versión V05 (Modelo Eficiente JSONB)
  const { data: dbSolicitudes, error: fetchError, isLoading: isFetching } = useSupabaseCollection(isUserAuthenticated ? 'RequisicionesV05' : null);
  
  if (fetchError) {
    console.error("Error al cargar Requisiciones de Supabase:", fetchError);
  }

  const { data: dbCuentasPresupuestos } = useSupabaseCollection(isUserAuthenticated ? 'CuentasPresupuestos' : null);
  const { data: materiales } = useSupabaseCollection<Material & { id: string }>(isUserAuthenticated ? 'ListaDeMateriales' : null);
  const { data: familias } = useSupabaseCollection<FamiliaMaterial & { id: string }>(isUserAuthenticated ? 'familias_materiales' : null);
  const { data: dbProveedores } = useSupabaseCollection(isUserAuthenticated ? 'Proveedores' : null);
  const { data: dbCentrosCostos } = useSupabaseCollection(isUserAuthenticated ? 'centrosCostos' : null);
  const { data: dbCentrosNegocios } = useSupabaseCollection(isUserAuthenticated ? 'CentrosDeNegocios' : null);
  const { data: dbUsers } = useSupabaseCollection(isUserAuthenticated ? 'user_profiles' : null);
  const { data: dbRequisicionesV04 } = useSupabaseCollection(isUserAuthenticated ? 'RequisicionesV04' : null);
  const { data: dbOrdenesV04 } = useSupabaseCollection(isUserAuthenticated ? 'OrdenesCompraV04' : null);
  const { data: dbOrdenesV05 } = useSupabaseCollection(isUserAuthenticated ? 'OrdenesCompraV05' : null);

  const proveedores: any[] = dbProveedores || [];
  const cuentas: any[] = dbCuentasPresupuestos || [];
  const presupuestos: any[] = dbCentrosCostos || [];
  const centrosNegocios: any[] = dbCentrosNegocios || [];
  const centrosCostos: any[] = dbCentrosCostos || [];

  // Sync local solicitudes with DB ones
  useEffect(() => {
    if (dbSolicitudes) {
      console.log(`Procesando ${dbSolicitudes.length} requisiciones de la base de datos.`);
      
      const normalizedData: Solicitud[] = dbSolicitudes.map((s: any) => {
        // En V05 los ítems están en la columna Items_JSON
        const rowItems = typeof s.Items_JSON === 'string' ? JSON.parse(s.Items_JSON) : (s.Items_JSON || []);
        
        const parsedFechaEntrega = s["Fecha Entrega"] || s.fechaEntrega || s.fecha_entrega || rowItems[0]?.fecha_entrega || rowItems[0]?.fechaEntrega || "";
        return {
          db_id: s.id, // Store the actual Supabase UUID for updates
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
            cuentaPresupuesto: item.cuentaPresupuesto || item.cuenta_presupuesto || item["Cuentas Presupuesto"] || '',
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
          solicitanteId: s.solicitanteId || s.solicitanteid || s.requesterId || s.requesterid || "",
          moneda: s.Moneda || 'CLP',
          "Fecha Entrega": parsedFechaEntrega,
          fechaEntrega: parsedFechaEntrega,
        } as Solicitud;
      });

      console.log(`Normalizadas ${normalizedData.length} requisiciones únicas.`);
      setSolicitudes(normalizedData);
    }
  }, [dbSolicitudes]);

  useEffect(() => {
    if (dbOrdenesV05) {
      const normalized = dbOrdenesV05.map((oc: any) => ({
        ...oc,
        id: oc["N° Orden"] || oc.id || "",
        solicitudId: oc["Requisición"] || oc.solicitudId || "",
        createdAt: oc["Fecha"] || oc.createdAt || new Date().toISOString(),
        supplierName: oc["Proveedor"] || oc.supplierName || "",
        totalGlobal: oc["Total_Global"] || oc.totalGlobal || 0,
        moneda: oc["Moneda"] || oc.moneda || "CLP",
        items: typeof oc.Items_JSON === 'string' ? JSON.parse(oc.Items_JSON) : (oc.Items_JSON || []),
        status: (oc["Estatus"] || oc.estatus || 'generado').toLowerCase(),
        poDescription: oc["Observaciones"] || oc.poDescription || '',
        totalCost: oc["Total_Global"] || oc.totalCost || 0,
        centroCostos: oc["CECO"] || oc.centroCostos || '',
        centroNegocios: oc["CENE"] || oc.centroNegocios || '',
        cuentaPresupuesto: (typeof oc.Items_JSON === 'string' ? JSON.parse(oc.Items_JSON) : (oc.Items_JSON || []))[0]?.cuentaPresupuesto || '',
      }));
      setOrdenesCompra(normalized);
    }
  }, [dbOrdenesV05]);



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
    if (updates.status) {
      dbUpdates["Estatus"] = updates.status;
      dbUpdates["Fecha Estatus"] = new Date().toISOString();
    }
    if (updates.id) dbUpdates["N° Requisición"] = updates.id;
    if (updates.createdAt) dbUpdates["Fecha"] = updates.createdAt;
    
    // Remove internal fields that shouldn't be in DB directly or were already mapped
    delete dbUpdates.id;
    delete dbUpdates.status;
    delete dbUpdates.createdAt;
    delete dbUpdates.solicitanteName;
    delete dbUpdates.totalEstimatedCost;

    const targetSolicitud = solicitudes.find(s => s.id === id);
    const dbId = targetSolicitud?.db_id;

    if (!dbId) {
      console.warn('No se encontró el UUID de la base de datos para la solicitud:', id);
    }

    // Usamos comillas dobles para el nombre de la columna con caracteres especiales si no tenemos el UUID
    const { error } = await supabase
      .from('RequisicionesV05')
      .update(dbUpdates)
      .eq(dbId ? 'id' : '"N° Requisición"', dbId || id);

    if (error) {
      console.error('Error updating solicitud in Supabase:', JSON.stringify(error, null, 2));
      toast({
        variant: 'destructive',
        title: "Error de sincronización",
        description: `No se pudo actualizar el estado de la requisición en la base de datos: ${error.message}`,
      });
    }
  }, [toast, solicitudes]);

  const toggleFavorite = useCallback(async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('RequisicionesV05')
      .update({ "Es_Favorita": !currentStatus })
      .eq('"N° Requisición"', id);

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
    
    // Calculate next correlative ID across V04 and V05
    // Buscar máximo correlativo en V04 y V05
    const allReqs = [...(dbRequisicionesV04 || []), ...(dbSolicitudes || [])];
    let maxNum = 100005344; // Baseline manual solicitado
    
    allReqs.forEach(r => {
      const idStr = String(r["N° Requisición"] || r["REQUISICIÓN"] || r.id || "");
      const numericPart = idStr.replace(/\D/g, "");
      if (numericPart) {
        const val = parseInt(numericPart);
        if (val > maxNum) maxNum = val;
      }
    });

    const nextNumeric = maxNum + 1;
    // Formatear con puntos (ej: 100.005.345)
    const formattedId = nextNumeric.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const reqId = newSolicitudData.id || formattedId;
    
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
        monto_total_iva: isAfecto ? Math.round(neto * 1.19) : neto,
        fecha_entrega: newSolicitudData.fechaEntrega || '',
        cuentaPresupuesto: item.cuentaPresupuesto || '',
        cuenta_presupuesto: item.cuentaPresupuesto || ''
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

      // Enviar notificación por correo (SMTP)
      // Lo hacemos de forma asíncrona sin bloquear la UI
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          solicitud: {
            id: reqId,
            solicitanteName: newSolicitudData.solicitanteName || currentUser.name,
            proveedor: newSolicitudData.proveedor,
            totalEstimatedCost: totalGlobal,
            moneda: newSolicitudData.moneda || 'CLP',
            items: newSolicitudData.items || []
          } 
        })
      }).catch(err => console.error('Error al enviar notificación por correo:', err));
    }
  }, [currentUser, solicitudes.length, toast]);

  const addOrdenCompra = useCallback(async (newOrdenData: Omit<OrdenCompra, 'id' | 'createdAt' | 'dia' | 'mes' | 'nMes' | 'anio' | 'semana' | 'estatus'> & Partial<Pick<OrdenCompra, 'issuedByUserId'>>, solicitudId: string) => {
    // Calculate next correlative ID across V04 and V05
    const idsV04 = (dbOrdenesV04 || []).map((o: any) => String(o["ORDEN DE COMPRA"] || ""));
    const idsV05 = (dbOrdenesV05 || []).map((o: any) => String(o["N° Orden"] || ""));
    const allIds = [...idsV04, ...idsV05];
    
    let maxNum = 0;
    allIds.forEach(id => {
      const numMatch = id.match(/\d+/);
      if (numMatch) {
        const val = parseInt(numMatch[0]);
        if (val > maxNum) maxNum = val;
      }
    });

    const ocId = `OC-${String(maxNum + 1).padStart(4, '0')}`;
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
      estatus: 'completado',
      issuedByUserId: currentUser?.id || ''
    };

    // Save to V05 Improved structure (JSONB)
    const dbOrdenV05 = {
      "N° Orden": ocId,
      "Fecha": now.toISOString(),
      "Proveedor": newOrdenData.supplierName,
      "Total_Neto": newOrdenData.totalNeto,
      "Total_IVA": newOrdenData.totalIva,
      "Total_Global": newOrdenData.totalGlobal,
      "Moneda": newOrdenData.moneda,
      "Items_JSON": newOrdenData.items,
      "Estatus": 'completado',
      "Requisición": solicitudId,
      "Año": year,
      "Mes": monthName,
      "Día": day,
      "CECO": newOrdenData.centroCostos || '',
      "CENE": newOrdenData.centroNegocios || '',
      "Ref": newOrdenData.referencia || '',
      "Observaciones": newOrdenData.observaciones || '',
      "Forma de Pago": newOrdenData.formaPago || ''
    };
    
    const { error: v05Error } = await supabase.from('OrdenesCompraV05').insert([dbOrdenV05]);
    
    if (v05Error) {
      console.error('Error al persistir OC en Supabase:', v05Error);
      toast({
        variant: 'destructive',
        title: "Error de Persistencia",
        description: `No se pudo guardar en la base de datos: ${v05Error.message}.`,
      });
    }

    setOrdenesCompra(prev => [newOrden, ...prev]);
    
    // Actualizamos la solicitud a 'oc creada' y guardamos la referencia de la OC
    await updateSolicitud(solicitudId, { 
      status: 'oc creada',
      "Ref OC": ocId 
    });

    toast({
      title: "Orden de Compra Generada",
      description: `La OC ${ocId} ha sido creada con éxito.`,
    });
  }, [ordenesCompra.length, updateSolicitud, toast, currentUser]);

  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error('Error signing out:', error);
    } finally {
      setCurrentUser(null);
    }
  }, []);

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
    users: dbUsers || [], // Exposing actual user profiles
    solicitudes,
    updateSolicitud,
    toggleFavorite,
    addSolicitud,
    ordenesCompra,
    ordenesCompraV04: dbOrdenesV04 || [],
    ordenesCompraV05: dbOrdenesV05 || [],
    dbRequisicionesV04: dbRequisicionesV04 || [],
    dbOrdenesV04: dbOrdenesV04 || [],
    dbOrdenesV05: dbOrdenesV05 || [],
    addOrdenCompra,
    getHistoricalDataForItems,
    proveedores: proveedores || [],
    cuentas: cuentas || [],
    presupuestos: presupuestos || [],
    centrosNegocios: centrosNegocios || [],
    centrosCostos: centrosCostos || [],
    materiales: materiales || [],
    familias: familias || [],
    addAdminItem,
    removeAdminItem,
    updateAdminItem,
    addMultipleAdminItems,
    logout,
  }), [
    currentUser, combinedIsLoading, dbUsers, solicitudes, updateSolicitud, toggleFavorite, 
    addSolicitud, ordenesCompra, dbOrdenesV04, dbOrdenesV05, dbRequisicionesV04, 
    addOrdenCompra, getHistoricalDataForItems, proveedores, cuentas, presupuestos, 
    centrosNegocios, centrosCostos, materiales, familias, addAdminItem, removeAdminItem, 
    updateAdminItem, addMultipleAdminItems, handleSetCurrentUser, logout
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}



export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
