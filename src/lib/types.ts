
export interface AIAnalysis {
  summary: string;
  keyPoints: string[];
  anomaliesDetected: boolean;
}

export type User = {
  id: string;
  name: string; // Corresponds to displayName
  email: string;
  role: 'solicitante' | 'compras';
  department?: string;
  cargo?: string;
  centroCostos?: string;
  centroNegocios?: string;
  avatar?: string;
  createdAt?: string;
};

export type Item = {
  id: string;
  name: string;
  codigoMaterial?: string;
  quantity: number;
  estimatedCost: number;
  descripcion?: string;
  cuentaPresupuesto?: string;
  nroItem?: number;
  montoNeto?: number;
  montoTotalIva?: number;
};

export type Solicitud = {
  // Engine Fields (Invisible but essential)
  db_id?: number;
  solicitanteId: string;
  items: Item[];

  // THE 20 SPANISH CSV COLUMNS (Direct matching)
  "N° Requisición"?: string;
  "Fecha"?: string;
  "Hora"?: string;
  "Solicitante"?: string;
  "Cargo"?: string;
  "Centro de Costos"?: string;
  "Centro de Negocios"?: string;
  "Proveedor"?: string;
  "Autorizado por"?: string;
  "Item"?: string;
  "Código Material"?: string;
  "Unidades"?: string;
  "Descripción"?: string;
  "Cuenta Presupuesto"?: string;
  "Precio Unitario"?: string;
  "Fecha Entrega"?: string;
  "Total"?: string | number;
  "Estatus"?: string;
  "Fecha Estatus"?: string;
  "Ref OC"?: string;

  id?: string;
  status?: string;
  createdAt?: string;
  solicitanteName?: string;
  totalEstimatedCost?: number;
  totalNeto?: number;
  totalIva?: number;
  totalGlobal?: number;
  comments?: string;
  proveedor?: string;
  department?: string;
  cargo?: string;
  centroCostos?: string;
  centroNegocios?: string;
  isAfectoIVA?: boolean;
  "Moneda"?: 'CLP' | 'USD' | 'UF';
  moneda?: 'CLP' | 'USD' | 'UF';
  summary?: AIAnalysis;
  isFavorite?: boolean;
};

export type OrdenCompra = {
  id: string;
  solicitudId: string;
  createdAt: string;
  
  // Dates breakdown
  dia: number;
  mes: string;
  nMes: number;
  anio: number;
  semana: number;

  // Header Info
  referencia?: string;
  tipo?: string;
  estatus: string;
  observaciones?: string;
  
  // Financials
  moneda: 'CLP' | 'USD' | 'UF';
  descuento?: number;
  impuesto?: number;
  totalNeto: number;
  totalIva: number;
  totalGlobal: number;
  
  // Administrative
  centroCostos?: string;
  centroNegocios?: string;
  cuentaPresupuesto?: string;
  formaPago?: string;
  diasEntrega?: number;

  // Supplier Full Info
  supplierName: string;
  razonSocial?: string;
  direccion?: string;
  rut?: string;
  ciudad?: string;
  pais?: string;
  telefono?: string;
  email?: string;

  // Items
  items: {
    id: string;
    name: string;
    quantity: number;
    unitCost: number;
    montoNeto: number;
    montoTotalIva: number;
    codigoMaterial?: string;
    cuentaPresupuesto?: string;
  }[];
};

export type Proveedor = {
  id: string;
  "Nombre de Fantasia"?: string;
  "RAZON SOCIAL"?: string;
  "DIRECCION"?: string;
  "RUT"?: string;
  "CIUDAD"?: string;
  "PAÌS"?: string;
  "TELEFONO"?: string;
  "EMAIL"?: string;
  "Codigo Proveedor"?: string;
  "NUMERO DE CUENTA"?: string;
  "CODIGO DE BANCO"?: string;
  "BANCO"?: string;
  "OBSERVACIONES"?: string;
  "Forma de Pago"?: string;
  "Vigencia"?: string;
  "COMENTARIO"?: string;
  "lead-time"?: string;
  "Compra Mínima"?: number;
  "Beneficios"?: string[];
  
  // Backwards compatibility/aliases
  name?: string;
  razonSocial?: string;
  direccion?: string;
  rut?: string;
  ciudad?: string;
  pais?: string;
  telefono?: string;
  email?: string;
  leadTime?: string;
};

export type Cuenta = {
  id: string;
  name: string;
  code: string;
};

export type Presupuesto = {
  id: string;
  name: string;
  monto: number;
};

export type CentroNegocios = {
  id: string;
  name?: string;
  Name?: string;
};

export type CentroCostos = {
  id: string;
  name: string;
  code: string;
  area?: string;
};

export type Material = {
  id: string;
  codigo: string;
  descripcion: string;
};
