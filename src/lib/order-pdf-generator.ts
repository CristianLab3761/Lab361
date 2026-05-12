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
      return `UF ${amount.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} UF`;
    }
    const formatter = new Intl.NumberFormat(watchedMoneda === 'CLP' ? 'es-CL' : 'en-US', {
      style: 'currency',
      currency: watchedMoneda === 'CLP' ? 'CLP' : 'USD',
    });
    return `${formatter.format(amount)} ${watchedMoneda}`;
  };

  doc.setFont('helvetica');
  doc.setFontSize(9);
  doc.setTextColor(...COLOR_TEXTO);

  // --- ENCABEZADO ---
  autoTable(doc, {
    startY: currentY,
    body: [
      [
        {
          content: 'ORDEN DE COMPRA',
          styles: {
            halign: 'center',
            valign: 'middle',
            fontSize: 16,
            fontStyle: 'bold',
            textColor: [0, 0, 0]
          }
        }
      ]
    ],
    theme: 'plain',
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // --- DATOS GENERALES ---
  autoTable(doc, {
    startY: currentY,
    head: [[{ content: 'INFORMACIÓN DE LA ORDEN', colSpan: 4, styles: { fillColor: COLOR_FONDO_CABECERA, textColor: [0, 0, 0], fontStyle: 'bold' } }]],
    body: [
      [
        { content: 'NRO ORDEN:', styles: { fontStyle: 'bold', cellWidth: 35 } },
        { content: order.id.toUpperCase(), styles: { cellWidth: 60 } },
        { content: 'FECHA EMISIÓN:', styles: { fontStyle: 'bold', cellWidth: 35 } },
        { content: format(new Date(order.createdAt), 'dd/MM/yyyy'), styles: { cellWidth: 60 } }
      ],
      [
        { content: 'REFERENCIA:', styles: { fontStyle: 'bold' } },
        { content: order.referencia || 'N/A' },
        { content: 'TIPO:', styles: { fontStyle: 'bold' } },
        { content: order.tipo || 'Compra Directa' }
      ]
    ],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, lineColor: COLOR_BORDE },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // --- DATOS DEL PROVEEDOR ---
  autoTable(doc, {
    startY: currentY,
    head: [[{ content: 'DATOS DEL PROVEEDOR', colSpan: 2, styles: { fillColor: COLOR_FONDO_CABECERA, textColor: [0, 0, 0], fontStyle: 'bold' } }]],
    body: [
      [
        { content: 'RAZÓN SOCIAL:', styles: { fontStyle: 'bold', cellWidth: 40 } },
        { content: order.razonSocial || order.supplierName }
      ],
      [
        { content: 'RUT:', styles: { fontStyle: 'bold' } },
        { content: order.rut || 'N/A' }
      ],
      [
        { content: 'DIRECCIÓN:', styles: { fontStyle: 'bold' } },
        { content: `${order.direccion || ''}, ${order.ciudad || ''}, ${order.pais || ''}` }
      ],
      [
        { content: 'CONTACTO:', styles: { fontStyle: 'bold' } },
        { content: `${order.email || ''} / ${order.telefono || ''}` }
      ],
      [
        { content: 'FORMA DE PAGO:', styles: { fontStyle: 'bold' } },
        { content: order.formaPago || 'N/A' }
      ]
    ],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, lineColor: COLOR_BORDE },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // --- DETALLE DE ITEMS ---
  const tableItems = order.items.map(item => {
    const net = item.montoNeto || (item.quantity * item.unitCost) || 0;
    return [
      item.codigoMaterial || 'N/A',
      item.name,
      item.quantity.toString(),
      formatPDFCurrency(item.unitCost || 0),
      formatPDFCurrency(net)
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [
      [
        { content: 'CÓDIGO', styles: { fillColor: COLOR_FONDO_CABECERA, textColor: [0, 0, 0] } },
        { content: 'DESCRIPCIÓN', styles: { fillColor: COLOR_FONDO_CABECERA, textColor: [0, 0, 0] } },
        { content: 'CANT.', styles: { halign: 'center', fillColor: COLOR_FONDO_CABECERA, textColor: [0, 0, 0] } },
        { content: 'P. UNITARIO', styles: { halign: 'right', fillColor: COLOR_FONDO_CABECERA, textColor: [0, 0, 0] } },
        { content: 'TOTAL NETO', styles: { halign: 'right', fillColor: COLOR_FONDO_CABECERA, textColor: [0, 0, 0] } }
      ]
    ],
    body: tableItems,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, lineColor: COLOR_BORDE },
    columnStyles: {
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'right', cellWidth: 35 },
      4: { halign: 'right', cellWidth: 35 }
    },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // --- TOTALES ---
  const calculatedNeto = order.totalNeto || order.items.reduce((acc, item) => acc + (item.montoNeto || (item.quantity * item.unitCost)), 0) || 0;
  const calculatedIva = order.totalIva !== undefined ? order.totalIva : (calculatedNeto * 0.19);
  const calculatedGlobal = order.totalGlobal || order.totalCost || (calculatedNeto + calculatedIva);

  const totalsX = PAGE_WIDTH - 84;
  autoTable(doc, {
    startY: currentY,
    margin: { left: totalsX },
    body: [
      [
        { content: 'TOTAL NETO:', styles: { fontStyle: 'bold', halign: 'right', cellWidth: 40 } },
        { content: formatPDFCurrency(calculatedNeto), styles: { halign: 'right', cellWidth: 30 } }
      ],
      order.descuento ? [
        { content: 'DESCUENTO:', styles: { fontStyle: 'bold', halign: 'right' } },
        { content: formatPDFCurrency(order.descuento), styles: { halign: 'right' } }
      ] : [],
      [
        { content: 'IVA (19%):', styles: { fontStyle: 'bold', halign: 'right' } },
        { content: formatPDFCurrency(calculatedIva), styles: { halign: 'right' } }
      ],
      [
        { content: 'TOTAL ORDEN:', styles: { fontStyle: 'bold', fontSize: 10, halign: 'right', fillColor: [0, 0, 0], textColor: [255, 255, 255] } },
        { content: formatPDFCurrency(calculatedGlobal), styles: { fontSize: 10, halign: 'right', fontStyle: 'bold', fillColor: [0, 0, 0], textColor: [255, 255, 255] } }
      ]
    ].filter(row => row.length > 0),
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, lineColor: COLOR_BORDE }
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // --- OBSERVACIONES ---
  if (order.observaciones) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('OBSERVACIONES:', 14, currentY);
    currentY += 4;
    doc.setFont('helvetica', 'normal');
    const splitText = doc.splitTextToSize(order.observaciones, PAGE_WIDTH - 28);
    doc.text(splitText, 14, currentY);
    currentY += splitText.length * 4 + 10;
  }

  // --- FIRMAS ---
  currentY = Math.max(currentY, doc.internal.pageSize.getHeight() - 40);
  doc.line(14, currentY, 80, currentY);
  doc.line(PAGE_WIDTH - 80, currentY, PAGE_WIDTH - 14, currentY);
  
  doc.setFontSize(7);
  doc.text('FIRMA RESPONSABLE COMPRAS', 14, currentY + 4);
  doc.text('FIRMA GERENCIA / FINANZAS', PAGE_WIDTH - 80, currentY + 4);

  doc.save(`${order.id.toUpperCase()}.pdf`);
};
