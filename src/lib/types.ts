import type { IntelligentPODraftingOutput } from "@/ai/flows/intelligent-po-drafting-flow";
import type { PurchaseRequestSummarizerOutput } from "@/ai/flows/purchase-request-summarizer-flow";

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'solicitante' | 'compras';
  avatar: string;
};

export type Item = {
  id: string;
  name: string;
  quantity: number;
  estimatedCost: number;
};

export type Solicitud = {
  id: string;
  solicitanteId: string;
  solicitanteName: string;
  department: string;
  createdAt: string;
  status: 'pendiente' | 'aprobada' | 'rechazada' | 'procesada';
  items: Item[];
  totalEstimatedCost: number;
  comments?: string;
  summary?: PurchaseRequestSummarizerOutput;
  draftPO?: IntelligentPODraftingOutput;
};

export type OrdenCompra = {
  id: string;
  solicitudId: string;
  createdAt: string;
  supplierName: string;
  paymentTerms: string;
  deliveryInstructions: string;
  poDescription: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    unitCost: number;
  }[];
  totalCost: number;
};
