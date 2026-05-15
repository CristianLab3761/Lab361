import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// --- CONFIGURACIÓN DE COLORES CORPORATIVOS (Gris Formulario) ---
const COLOR_BORDE: [number, number, number] = [150, 150, 150]; // Gris medio para bordes
const COLOR_FONDO_CABECERA: [number, number, number] = [230, 230, 230]; // Gris claro para fondos
const COLOR_TEXTO: [number, number, number] = [30, 30, 30]; // Casi negro para texto

// === INSTRUCCIONES PARA EL LOGO ===
// Necesitas convertir tu imagen 'logo.png' a una cadena Base64.
// Puedes usar un conversor online (busca "image to base64").
// Pega la cadena larga resultante entre las comillas simples de abajo.
const LOGO_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABnIAAAJVCAYAAADqXmuZAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QzI0MTVDNjAxMjBFMTFFQUEzMEQ4OUFEOTdFRkQ0QzUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QzI0MTVDNjExMjBFMTFFQUEzMEQ4OUFEOTdFRkQ0QzUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpDMjQxNUM1RTEyMEUxMUVBQTMwRDg5QUQ5N0VGRDRDNSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpDMjQxNUM1RjEyMEUxMUVBQTMwRDg5QUQ5N0VGRDRDNSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PqG67sAAANLgSURBVHja7N0HvBTV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';
export const generateRequisitionPDF = (solicitud: any) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const PAGE_WIDTH = doc.internal.pageSize.getWidth();
  let currentY = 15;

  const watchedMoneda = solicitud.moneda || solicitud.Moneda || 'CLP';

  const formatPDFCurrency = (amount: number) => {
    if (watchedMoneda === 'UF') {
      return `UF ${amount.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
    }
    const formatter = new Intl.NumberFormat(watchedMoneda === 'CLP' ? 'es-CL' : 'en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return `$${formatter.format(amount)}`;
  };

  // --- CÁLCULO DE TOTALES ---
  const totalNeto = solicitud.items?.reduce((acc: number, item: any) => acc + ((item.quantity || 0) * (item.estimatedCost || 0)), 0) || 0;
  const totalIva = totalNeto * 0.19;
  const totalGlobal = totalNeto + totalIva;

  doc.setFont('helvetica');

  // --- LOGO Y TÍTULO ---
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 100, 200);
  doc.text('Botanical', 14, currentY + 5);
  doc.text('Solutions', 14, currentY + 11);
  
  doc.setDrawColor(0, 100, 200);
  doc.setLineWidth(1);
  doc.line(38, currentY + 2, 42, currentY + 12);
  doc.line(42, currentY + 12, 46, currentY + 5);

  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.text('REQUISICIÓN DE COMPRA', PAGE_WIDTH - 14, currentY + 10, { align: 'right' });
  
  currentY += 20;

  // --- BARRA DE INFO SUPERIOR ---
  autoTable(doc, {
    startY: currentY,
    body: [
      [
        { content: 'N° REQ:', styles: { fontStyle: 'bold', cellWidth: 20 } },
        { content: (solicitud.solicitudId || solicitud.id || 'NUEVA').toUpperCase().substring(0, 12), styles: { fillColor: [240, 240, 240], fontStyle: 'bold', cellWidth: 40 } },
        { content: '', styles: { cellWidth: 35 } },
        { content: 'Prioridad:', styles: { fontStyle: 'bold', cellWidth: 25 } },
        { content: solicitud.prioridad || 'Normal', styles: { halign: 'center', cellWidth: 25 } },
        { content: 'Fecha:', styles: { fontStyle: 'bold', cellWidth: 20 } },
        { content: format(new Date(solicitud.createdAt || new Date()), 'dd/MM/yyyy'), styles: { halign: 'center' } }
      ]
    ],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.5, lineColor: [200, 200, 200] },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // --- SOLICITANTE Y DETALLES DE COSTO ---
  autoTable(doc, {
    startY: currentY,
    head: [[
      { content: 'Información del Solicitante', styles: { halign: 'center', fillColor: [245, 245, 245], textColor: 0, fontStyle: 'bold' } },
      { content: '', styles: { fillColor: [255, 255, 255], cellWidth: 10 } },
      { content: 'Centro de Costo y Presupuesto', styles: { halign: 'center', fillColor: [245, 245, 245], textColor: 0, fontStyle: 'bold' } }
    ]],
    body: [
      [
        { 
          content: [
            `Nombre:      ${solicitud.solicitanteName || solicitud.Solicitante || solicitud.solicitante_nombre || '-'}`,
            `Cargo/Depto: ${solicitud.cargo || solicitud.Cargo || solicitud.cargo_solicitante || '-'}`,
            `Email:       ${solicitud.solicitanteEmail || solicitud.usuarioEmail || ''}`,
            `Motivo:      ${solicitud.motivo || 'Operacional'}`
          ].join('\n'),
          styles: { fontSize: 8, cellPadding: 3 }
        },
        { content: '' },
        { 
          content: [
            `Centro Costo: ${solicitud.centroCostos || solicitud["Centro de Costos"] || solicitud.centro_costos || '-'}`,
            `Cuenta Presu: ${solicitud.cuentaPresupuesto || solicitud.cuentaPresupuestaria || '-'}`,
            `Moneda:       ${watchedMoneda}`,
            `Obra/Proyecto: ${solicitud.proyecto || solicitud.centroNegocios || 'General'}`
          ].join('\n'),
          styles: { fontSize: 8, cellPadding: 3 }
        }
      ]
    ],
    theme: 'grid',
    styles: { lineColor: [220, 220, 220] },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // --- TABLA DE ÍTEMS ---
  const tableData = (solicitud.items || []).map((item: any, index: number) => [
    index + 1,
    item.codigoMaterial || '-',
    item.name || item.descripcion || '-',
    item.quantity || 0,
    formatPDFCurrency(item.estimatedCost || 0),
    formatPDFCurrency((item.quantity || 0) * (item.estimatedCost || 0))
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Item', 'Código', 'Descripción', 'Cant.', 'Precio Est.', 'Subtotal']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [230, 230, 230],
      textColor: 0,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
      lineColor: [150, 150, 150]
    },
    styles: {
      fontSize: 7,
      cellPadding: 2,
      lineColor: [180, 180, 180],
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 30, halign: 'right' },
      5: { cellWidth: 30, halign: 'right' }
    },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // --- TOTALES Y OBSERVACIONES ---
  autoTable(doc, {
    startY: currentY,
    body: [
      [
        { 
          content: `OBSERVACIONES:\n${solicitud.observaciones || 'Sin observaciones adicionales.'}`, 
          styles: { fontSize: 8, cellPadding: 4, cellWidth: 110, valign: 'top' } 
        },
        { 
          content: 'MONTO NETO:\nIVA (19%):\nTOTAL REQUISICIÓN:',
          styles: { halign: 'right', fontStyle: 'bold', fontSize: 8, cellPadding: 4 } 
        },
        {
          content: `${formatPDFCurrency(totalNeto)}\n${formatPDFCurrency(totalIva)}\n${formatPDFCurrency(totalGlobal)}`,
          styles: { halign: 'right', fontStyle: 'bold', fontSize: 9, cellPadding: 4, textColor: [0, 100, 200] }
        }
      ]
    ],
    theme: 'grid',
    styles: { lineColor: [200, 200, 200] },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // --- FIRMAS ---
  autoTable(doc, {
    startY: currentY,
    body: [
      [
        { content: '__________________________\nSolicitado por', styles: { halign: 'center' } },
        { content: '__________________________\nAutorizado por', styles: { halign: 'center' } }
      ]
    ],
    theme: 'plain',
    styles: { fontSize: 8 },
    margin: { left: 14, right: 14 }
  });

  return doc;
};