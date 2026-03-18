'use server';
/**
 * @fileOverview This file defines a Genkit flow for summarizing purchase requests and detecting anomalies.
 *
 * - summarizePurchaseRequest - A function that handles the summarization and anomaly detection process.
 * - PurchaseRequestSummarizerInput - The input type for the summarizePurchaseRequest function.
 * - PurchaseRequestSummarizerOutput - The return type for the summarizePurchaseRequest function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PurchaseRequestItemSchema = z.object({
  name: z.string().describe('Name of the item.'),
  quantity: z.number().int().positive().describe('Quantity of the item.'),
  estimatedCost: z.number().positive().describe('Estimated cost per item.'),
});

const HistoricalDataItemSchema = z.object({
  name: z.string().describe('Name of the historical item.'),
  averageCost: z.number().positive().describe('Average historical cost per item.'),
});

const PurchaseRequestSummarizerInputSchema = z.object({
  currentRequest: z.object({
    id: z.string().describe('Unique ID of the purchase request.'),
    requesterName: z.string().describe('Name of the person who made the request.'),
    department: z.string().optional().describe('Department of the requester.'),
    items: z.array(PurchaseRequestItemSchema).min(1).describe('List of items in the current purchase request.'),
    totalEstimatedCost: z.number().positive().describe('Total estimated cost of the current request.'),
  }).describe('Details of the current purchase request.'),
  historicalData: z.array(HistoricalDataItemSchema).optional().describe('Historical data of items for anomaly detection.'),
});
export type PurchaseRequestSummarizerInput = z.infer<typeof PurchaseRequestSummarizerInputSchema>;

const PurchaseRequestSummarizerOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the purchase request.'),
  keyPoints: z.array(z.string()).describe('Key points to consider, including potential anomalies.'),
  anomaliesDetected: z.boolean().describe('True if potential anomalies were detected, false otherwise.'),
});
export type PurchaseRequestSummarizerOutput = z.infer<typeof PurchaseRequestSummarizerOutputSchema>;

export async function summarizePurchaseRequest(
  input: PurchaseRequestSummarizerInput
): Promise<PurchaseRequestSummarizerOutput> {
  return purchaseRequestSummarizerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'purchaseRequestSummarizerPrompt',
  input: {schema: PurchaseRequestSummarizerInputSchema},
  output: {schema: PurchaseRequestSummarizerOutputSchema},
  prompt: `Eres un experto agente de compras. Tu tarea es analizar una solicitud de compra, proporcionar un resumen conciso y señalar cualquier posible anomalía basada en los datos históricos proporcionados.

---
Solicitud de Compra Actual:
ID: {{{currentRequest.id}}}
Solicitante: {{{currentRequest.requesterName}}}
{{#if currentRequest.department}}Departamento: {{{currentRequest.department}}}{{/if}}
Items:
{{#each currentRequest.items}}
- {{name}} (Cantidad: {{quantity}}, Costo Estimado por Unidad: \${{estimatedCost}})
{{/each}}
Costo Total Estimado: \${{{currentRequest.totalEstimatedCost}}}

---
{{#if historicalData}}
Datos Históricos (Costo Promedio por Unidad):
{{#each historicalData}}
- {{name}}: \${{averageCost}}
{{/each}}
{{else}}
No se proporcionaron datos históricos para comparación.
{{/if}}

---
Basándote en la información anterior, genera un resumen de la solicitud y lista los puntos clave, incluyendo cualquier anomalía detectada al comparar los costos estimados con los costos históricos promedio. Si no hay datos históricos, indica que la detección de anomalías se basa solo en el sentido común de los items.

Formato de Salida JSON Requerido:
\`\`\`json
{
  "summary": "Resumen conciso de la solicitud.",
  "keyPoints": [
    "Punto clave 1.",
    "Punto clave 2 (ej: Item X tiene un costo unitario significativamente alto comparado con el histórico de $Y).",
    "..."
  ],
  "anomaliesDetected": true/false
}
\`\`\`
`,
});

const purchaseRequestSummarizerFlow = ai.defineFlow(
  {
    name: 'purchaseRequestSummarizerFlow',
    inputSchema: PurchaseRequestSummarizerInputSchema,
    outputSchema: PurchaseRequestSummarizerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
