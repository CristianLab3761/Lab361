export type EnvioComex = {
  id: string;
  reference: string;
  status: string;
  origin: string;
  destination: string;
  merchandise_value_usd: number;
  total_weight_kg: number;
  total_volume_m3: number;
  chargeable_weight_kg: number;
  exchange_rate: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
};

export type CostoCotizacion = {
  concepto: string;
  monto: number;
  moneda: 'USD' | 'MXN';
  aplicaIva: boolean;
  baseCobro: 'Plana' | 'Por M3' | 'Por Kg' | 'Por BL' | '% Valor';
};

export type CotizacionComex = {
  id: string;
  envio_id: string;
  forwarder: string;
  incoterm: string;
  transport_mode: string;
  transit_time_days: number;
  route: string;
  costos_jsonb: CostoCotizacion[];
  total_usd: number;
  created_at: string;
  updated_at: string;
};
