import Papa from 'papaparse';
import { Solicitud } from './types';

/**
 * Exports all provided requisitions to a flattened CSV format compatible with Excel.
 * Each item in a requisition becomes a separate row.
 */
export const exportRequisitionsToCSV = (solicitudes: Solicitud[]) => {
  if (!solicitudes || solicitudes.length === 0) return;

  const flattenedData = solicitudes.flatMap(s => {
    const items = Array.isArray(s.items) ? s.items : [];
    
    // Base data for the requisition header
    const baseInfo = {
      "N° Requisición": s["N° Requisición"] || s.id || '',
      "Fecha": s["Fecha"] || '',
      "Hora": s["Hora"] || '',
      "Solicitante": s["Solicitante"] || s.solicitanteName || '',
      "Cargo": s["Cargo"] || s.cargo || '',
      "Centro de Negocios": s["Centro de Negocios"] || s.centroNegocios || '',
      "Centro de Costos": s["Centro de Costos"] || s.centroCostos || '',
      "Proveedor": s["Proveedor"] || s.proveedor || '',
      "Estatus": s["Estatus"] || s.status || '',
      "Moneda": s["Moneda"] || s.moneda || 'CLP',
      "Total Neto Req": s.totalNeto || 0,
      "Total IVA Req": s.totalIva || 0,
      "Total Global Req": s.totalGlobal || s.totalEstimatedCost || 0,
    };

    if (items.length === 0) {
      return [{
        ...baseInfo,
        "Nro Item": 0,
        "Código Material": "",
        "Descripción Item": "Sin ítems",
        "Cant": 0,
        "P. Unitario": 0,
        "Neto Item": 0,
        "IVA Item": 0,
        "Total Item": 0
      }];
    }

    return items.map((item, idx) => ({
      ...baseInfo,
      "Nro Item": item.nroItem || (idx + 1),
      "Código Material": item.codigoMaterial || '',
      "Descripción Item": item.name || '',
      "Cant": item.quantity || 0,
      "P. Unitario": item.estimatedCost || 0,
      "Neto Item": item.montoNeto || (item.quantity * item.estimatedCost),
      "IVA Item": item.montoTotalIva ? (item.montoTotalIva - (item.montoNeto || 0)) : 
                 (s.isAfectoIVA !== false ? (item.quantity * item.estimatedCost * 0.19) : 0),
      "Total Item": item.montoTotalIva || (item.quantity * item.estimatedCost * (s.isAfectoIVA !== false ? 1.19 : 1))
    }));
  });

  // unparse to CSV string
  const csv = Papa.unparse(flattenedData, {
    delimiter: ";", // Semicolon is the standard for Spanish Excel
    header: true,
  });

  // Use UTF-8 BOM to ensure Excel opens special characters correctly
  const BOM = "\uFEFF";
  const csvWithBOM = BOM + csv;
  
  const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const dateStr = new Date().toISOString().split('T')[0];
  link.href = url;
  link.setAttribute('download', `Reporte_Requisiciones_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
