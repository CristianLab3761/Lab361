import { Solicitud } from './types';
import { parseISO, format, differenceInDays } from 'date-fns';

export const USD_TO_CLP = 950;
export const UF_TO_CLP = 38000;

const convertToCLP = (amount: number, currency?: string) => {
  if (currency === 'USD') return amount * USD_TO_CLP;
  if (currency === 'UF') return amount * UF_TO_CLP;
  return amount;
};

export function getSpendByCategory(solicitudes: Solicitud[]) {
  const categoryMap: { [key: string]: number } = {};
  
  solicitudes.forEach(s => {
    const category = s["Centro de Costos"] || s.centroCostos || 'Sin Categoría';
    const amount = convertToCLP(s.totalGlobal || 0, s.moneda || s.Moneda);
    categoryMap[category] = (categoryMap[category] || 0) + amount;
  });

  return Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function getTopSuppliers(solicitudes: Solicitud[]) {
  const supplierMap: { [key: string]: number } = {};
  
  solicitudes.forEach(s => {
    const supplier = s["Proveedor"] || s.proveedor || 'Sin Proveedor';
    const amount = convertToCLP(s.totalGlobal || 0, s.moneda || s.Moneda);
    supplierMap[supplier] = (supplierMap[supplier] || 0) + amount;
  });

  return Object.entries(supplierMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

export function getMonthlySpendTrend(solicitudes: Solicitud[]) {
  const monthMap: { [key: string]: number } = {};
  
  solicitudes.forEach(s => {
    if (!s.createdAt) return;
    const month = format(parseISO(s.createdAt), 'MMM yy');
    const amount = convertToCLP(s.totalGlobal || 0, s.moneda || s.Moneda);
    monthMap[month] = (monthMap[month] || 0) + amount;
  });

  // Sort months chronologically? For now, just return as entries
  return Object.entries(monthMap).map(([name, value]) => ({ name, value }));
}

export function getCycleTimeStats(solicitudes: Solicitud[]) {
  const processed = solicitudes.filter(s => s.status === 'procesada' && s.createdAt && s["Fecha Estatus"]);
  if (processed.length === 0) return 0;

  const totalDays = processed.reduce((acc, s) => {
    const start = parseISO(s.createdAt!);
    const end = parseISO(s["Fecha Estatus"]!);
    return acc + differenceInDays(end, start);
  }, 0);

  return Math.round(totalDays / processed.length);
}

export function getSavingsData(solicitudes: Solicitud[]) {
  let estimated = 0;
  let actual = 0;

  solicitudes.forEach(s => {
    const est = convertToCLP(s.totalEstimatedCost || 0, s.moneda || s.Moneda);
    const act = convertToCLP(s.totalGlobal || 0, s.moneda || s.Moneda);
    estimated += est;
    actual += act;
  });

  const savings = estimated > actual ? estimated - actual : 0;
  const savingsPercent = estimated > 0 ? (savings / estimated) * 100 : 0;

  return { savings, savingsPercent };
}
