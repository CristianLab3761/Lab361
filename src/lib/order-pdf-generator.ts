import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { OrdenCompra } from './types';

// --- CONFIGURACIÓN DE COLORES CORPORATIVOS (Gris Formulario) ---
const COLOR_BORDE: [number, number, number] = [150, 150, 150]; // Gris medio para bordes
const COLOR_FONDO_CABECERA: [number, number, number] = [230, 230, 230]; // Gris claro para fondos
const COLOR_TEXTO: [number, number, number] = [30, 30, 30]; // Casi negro para texto

const LOGO_BASE64 = ''; // Reuse the same logo if needed, but I'll leave it empty or use the one from existing generator if I had it.
export const generateOrderPDF = (order: OrdenCompra) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const PAGE_WIDTH = doc.internal.pageSize.getWidth();
  let currentY = 10;

  const watchedMoneda = order.moneda || 'CLP';

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

  doc.setFont('helvetica');

  // --- LOGO Y TÍTULO ---
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Botanical', 14, currentY + 5);
  doc.text('Solutions', 14, currentY + 11);
  
  // Pequeño dibujo de logo (simulado)
  doc.setDrawColor(0, 100, 200);
  doc.setLineWidth(1);
  doc.line(38, currentY + 2, 42, currentY + 12);
  doc.line(42, currentY + 12, 46, currentY + 5);

  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text('Orden de Compra', PAGE_WIDTH - 14, currentY + 10, { align: 'right' });
  
  currentY += 15;

  // --- BARRA DE INFO SUPERIOR ---
  autoTable(doc, {
    startY: currentY,
    body: [
      [
        { content: 'N° OC:', styles: { fontStyle: 'bold', cellWidth: 20 } },
        { content: order.id.toUpperCase(), styles: { fillColor: [220, 240, 220], fontStyle: 'bold', cellWidth: 40 } },
        { content: '', styles: { cellWidth: 35 } },
        { content: 'Estatus:', styles: { fontStyle: 'bold', cellWidth: 25 } },
        { content: 'Vigente', styles: { halign: 'center', cellWidth: 25 } },
        { content: 'Fecha:', styles: { fontStyle: 'bold', cellWidth: 20 } },
        { content: format(new Date(order.createdAt), 'dd/MM/yyyy'), styles: { halign: 'center' } }
      ]
    ],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1, lineColor: [200, 200, 200] },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY;

  // --- COMPRADOR Y PROVEEDOR ---
  autoTable(doc, {
    startY: currentY,
    head: [[
      { content: 'Comprador', styles: { halign: 'center', fillColor: [245, 245, 245], textColor: 0, fontStyle: 'bold' } },
      { content: '', styles: { fillColor: [220, 220, 220], cellWidth: 60 } },
      { content: 'Proveedor', styles: { halign: 'center', fillColor: [245, 245, 245], textColor: 0, fontStyle: 'bold' } }
    ]],
    body: [
      [
        { 
          content: [
            `Nombre:      Botanical Solutions SpA`,
            `Razón Social: Botanical Solutions SpA`,
            `Dirección:    Av Quilin 3550, Lab 300, Macul`,
            `Rut:          76336365-1`,
            `Ciudad:       Santiago`,
            `País:         Chile`,
            `Teléfono:     +56 9 6104 6024`,
            `Email:        compras@botanicalsolutions.cl`
          ].join('\n'),
          styles: { fontSize: 7, cellPadding: 2 }
        },
        { content: '' },
        { 
          content: [
            `Nombre:      ${order.supplierName}`,
            `Razón Social: ${order.razonSocial || order.supplierName}`,
            `Dirección:    ${order.direccion || 'N/A'}`,
            `Rut:          ${order.rut || 'N/A'}`,
            `Ciudad:       ${order.ciudad || 'Santiago'}`,
            `País:         ${order.pais || 'Chile'}`,
            `Teléfono:     ${order.telefono || 'N/A'}`,
            `Email:        ${order.email || 'N/A'}`
          ].join('\n'),
          styles: { fontSize: 7, cellPadding: 2 }
        }
      ]
    ],
    theme: 'grid',
    styles: { lineColor: [200, 200, 200], valign: 'top' },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 2;

  // --- DETALLES DE TRANSACCIÓN ---
  autoTable(doc, {
    startY: currentY,
    body: [
      [
        { content: 'Centro de Costos:', styles: { fontStyle: 'bold', cellWidth: 40 } },
        { content: order.centroCostos || 'N/A', styles: { cellWidth: 55 } },
        { content: 'Dias estimados de Entrega:', styles: { fontStyle: 'bold', cellWidth: 50 } },
        { content: '2', styles: { halign: 'center' } }
      ],
      [
        { content: 'Centro de Negocios:', styles: { fontStyle: 'bold' } },
        { content: order.centroNegocios || 'N/A' },
        { content: 'Tipo de Moneda:', styles: { fontStyle: 'bold' } },
        { content: order.moneda || 'CLP', styles: { halign: 'center' } }
      ],
      [
        { content: 'Requisición:', styles: { fontStyle: 'bold' } },
        { content: order.solicitudId || 'N/A' },
        { content: 'Impuesto:', styles: { fontStyle: 'bold' } },
        { content: [
            { content: 'IVA', styles: { cellWidth: 15 } },
            { content: '19%', styles: { halign: 'center' } }
          ] }
      ],
      [
        { content: 'Observaciones:', styles: { fontStyle: 'bold' } },
        { content: order.observaciones || 'N/A', colSpan: 3 }
      ]
    ],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1, lineColor: [220, 220, 220] },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 4;

  // --- FORMA DE PAGO ---
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Forma de Pago:', 14, currentY);
  currentY += 2;
  autoTable(doc, {
    startY: currentY,
    body: [[{ content: order.formaPago || 'N/A', styles: { minHeight: 10, fontSize: 8 } }]],
    theme: 'grid',
    styles: { lineColor: [220, 220, 220] },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // --- TABLA DE ITEMS ---
  const tableItems = order.items.map(item => {
    const total = item.montoNeto || (item.quantity * item.unitCost) || 0;
    return [
      item.codigoMaterial || order.solicitudId + '-1',
      item.quantity.toString(),
      item.name.toUpperCase(),
      'AFECTO',
      '',
      formatPDFCurrency(item.unitCost || 0),
      formatPDFCurrency(total)
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [[
      { content: 'REF', styles: { halign: 'center' } },
      { content: 'Unidades', styles: { halign: 'center' } },
      { content: 'Descripción', styles: { halign: 'center' } },
      { content: 'Tipo', styles: { halign: 'center' } },
      { content: 'Descuento', styles: { halign: 'center' } },
      { content: 'Precio Unitario', styles: { halign: 'center' } },
      { content: 'Total', styles: { halign: 'center' } }
    ]],
    body: tableItems,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2, lineColor: [200, 200, 200] },
    headStyles: { fillColor: [255, 255, 255], textColor: 0, fontStyle: 'bold', lineWidth: 0.1 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 20 },
      5: { cellWidth: 25, halign: 'right' },
      6: { cellWidth: 25, halign: 'right', fillColor: [230, 230, 230], fontStyle: 'bold' }
    },
    margin: { left: 14, right: 14 }
  });

  doc.save(`${order.id.toUpperCase()}.pdf`);
};
