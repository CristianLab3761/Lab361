import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { OrdenCompra } from './types';

// --- CONFIGURACIÓN DE COLORES CORPORATIVOS ---
const COLOR_BORDE: [number, number, number] = [150, 150, 150];
const COLOR_FONDO_CABECERA: [number, number, number] = [230, 230, 230];
const COLOR_TEXTO: [number, number, number] = [30, 30, 30];

const getLogoBase64 = async (): Promise<string | null> => {
  try {
    const response = await fetch('/assets/marca-color-fondo-transparente (2).png');
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

export const generateOrderPDF = async (order: OrdenCompra, proveedores?: any[]) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const PAGE_WIDTH = doc.internal.pageSize.getWidth();
  let currentY = 10;

  const watchedMoneda = order.moneda || 'CLP';
  const items = order.items || [];

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
  const logoBase64 = await getLogoBase64();
  if (logoBase64) {
    doc.addImage(logoBase64, 'PNG', 14, currentY - 5, 45, 20);
  } else {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Botanical Solutions', 14, currentY + 8);
  }

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
        { content: order.id.toUpperCase().replace('OC-', ''), styles: { fillColor: [220, 240, 220], fontStyle: 'bold', cellWidth: 40 } },
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

  // Buscar proveedor en la lista maestra
  let supplierData = {
    razonSocial: order.razonSocial || order.supplierName,
    rut: order.rut,
    direccion: order.direccion,
    ciudad: order.ciudad || 'Santiago',
    pais: order.pais || 'Chile',
    telefono: order.telefono,
    email: order.email,
  };

  if (proveedores) {
    const pName = (order.supplierName || '').trim().toLowerCase();
    const found = proveedores.find(p =>
      (p['RAZON SOCIAL'] || '').toLowerCase().trim() === pName ||
      (p.name || '').toLowerCase().trim() === pName ||
      (p['Nombre de Fantasia'] || '').toLowerCase().trim() === pName
    );
    if (found) {
      supplierData.razonSocial = found['RAZON SOCIAL'] || found.name || supplierData.razonSocial;
      supplierData.rut = found['RUT'] || found.rut || supplierData.rut;
      supplierData.direccion = found['DIRECCION'] || found.direccion || supplierData.direccion;
      supplierData.ciudad = found['CIUDAD'] || found.ciudad || supplierData.ciudad;
      supplierData.pais = found['PAÌS'] || found.pais || supplierData.pais;
      supplierData.telefono = found['TELEFONO'] || found.telefono || supplierData.telefono;
      supplierData.email = found['EMAIL'] || found.email || supplierData.email;
    }
  }

  // --- COMPRADOR Y PROVEEDOR ---
  autoTable(doc, {
    startY: currentY,
    head: [[
      { content: 'Comprador', styles: { halign: 'center', fillColor: [245, 245, 245], textColor: 0, fontStyle: 'bold' } },
      { content: '', styles: { fillColor: [220, 220, 220], cellWidth: 20 } },
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
            `Razón Social: ${supplierData.razonSocial}`,
            `Dirección:    ${supplierData.direccion || 'N/A'}`,
            `Rut:          ${supplierData.rut || 'N/A'}`,
            `Ciudad:       ${supplierData.ciudad}`,
            `País:         ${supplierData.pais}`,
            `Teléfono:     ${supplierData.telefono || 'N/A'}`,
            `Email:        ${supplierData.email || 'N/A'}`
          ].join('\n'),
          styles: { fontSize: 7, cellPadding: 2 }
        }
      ]
    ],
    theme: 'grid',
    styles: { lineColor: [200, 200, 200], valign: 'top' },
    columnStyles: {
      0: { cellWidth: 81 },
      1: { cellWidth: 20 },
      2: { cellWidth: 81 }
    },
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
        { content: 'IVA 19%', styles: { halign: 'center' } }
      ],
      [
        { content: 'Observaciones:', styles: { fontStyle: 'bold' } },
        { content: order.poDescription || order.observaciones || 'N/A', colSpan: 3 }
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
    body: [[{ content: order.formaPago || 'N/A', styles: { fontSize: 8 } }]],
    theme: 'grid',
    styles: { lineColor: [220, 220, 220] },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // --- TABLA DE ITEMS (sin Cuenta Presupuesto) ---
  const tableItems = items.map(item => {
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
      2: { cellWidth: 50 },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 20 },
      5: { cellWidth: 25, halign: 'right' },
      6: { cellWidth: 25, halign: 'right', fillColor: [230, 230, 230], fontStyle: 'bold' }
    },
    margin: { left: 14, right: 14 }
  });

  doc.save(`${order.id.toUpperCase().replace('OC-', '')}.pdf`);
};
