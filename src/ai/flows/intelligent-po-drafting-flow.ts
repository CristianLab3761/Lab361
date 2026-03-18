'use server';
/**
 * @fileOverview This file implements a Genkit flow to intelligently draft Purchase Orders (PO).
 * It pre-fills key PO fields like supplier, payment terms, and description based on an approved purchase request
 * and historical data, aiming to streamline and improve accuracy in PO creation.
 *
 * - intelligentPODrafting - The main function to call for drafting a PO.
 * - IntelligentPODraftingInput - The input type for the intelligentPODrafting function.
 * - IntelligentPODraftingOutput - The return type for the intelligentPODrafting function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input schema for the intelligent PO drafting flow
const IntelligentPODraftingInputSchema = z.object({
  requestId: z.string().describe('The ID of the approved purchase request.'),
  applicantId: z.string().describe('The ID of the user who made the request.'),
  requestDescription: z.string().describe('A general description of the purchase request.'),
  items: z.array(
    z.object({
      name: z.string().describe('The name of the item.'),
      quantity: z.number().int().positive().describe('The quantity of the item.'),
      unitCost: z.number().positive().describe('The estimated unit cost of the item.'),
    })
  ).describe('A list of items to be purchased.'),
  estimatedTotalCost: z.number().positive().describe('The estimated total cost of the request.'),
});
export type IntelligentPODraftingInput = z.infer<typeof IntelligentPODraftingInputSchema>;

// Output schema for the intelligent PO drafting flow
const IntelligentPODraftingOutputSchema = z.object({
  supplierName: z.string().describe('The recommended supplier name for this purchase order.'),
  paymentTerms: z.string().describe('The recommended payment terms for this purchase order (e.g., Net 30, Due upon receipt).'),
  deliveryInstructions: z.string().describe('Any specific delivery instructions or notes.'),
  poDescription: z.string().describe('A concise description for the entire purchase order.'),
  justification: z.string().optional().describe('An optional justification for the suggested supplier and terms, based on historical data.'),
});
export type IntelligentPODraftingOutput = z.infer<typeof IntelligentPODraftingOutputSchema>;

// Schema for historical PO data that the tool will return
const HistoricalPODataItemSchema = z.object({
  supplierName: z.string().describe('Name of the supplier from historical data.'),
  paymentTerms: z.string().describe('Payment terms from historical data.'),
  deliveryInstructions: z.string().describe('Delivery instructions from historical data.'),
  poDescription: z.string().describe('Description of the historical purchase order.'),
  itemDetails: z.array(
    z.object({
      itemName: z.string().describe('Name of the item purchased historically.'),
      lastPrice: z.number().positive().describe('The last recorded price for this item.'),
    })
  ).describe('Details of items within the historical PO.'),
});
const HistoricalPODataSchema = z.array(HistoricalPODataItemSchema).describe('A list of historical purchase order data.');

/**
 * Genkit Tool to simulate fetching historical purchase order data.
 * In a real application, this would query a database for past POs matching the request items or applicant.
 */
const getHistoricalPOData = ai.defineTool(
  {
    name: 'getHistoricalPOData',
    description: 'Retrieves historical purchase order data relevant to the current request, including suppliers, payment terms, and item prices.',
    inputSchema: z.object({
      applicantId: z.string().describe('The ID of the applicant for whom to retrieve historical POs.'),
      itemNames: z.array(z.string()).describe('A list of item names to search for in historical POs.'),
    }),
    outputSchema: HistoricalPODataSchema,
  },
  async (input) => {
    // Simulate database query for historical data
    // In a real scenario, this would interact with Firestore or another database.
    console.log(`Fetching historical data for applicant ${input.applicantId} and items: ${input.itemNames.join(', ')}`);

    // Dummy historical data for demonstration
    const dummyHistoricalData: z.infer<typeof HistoricalPODataSchema> = [
      {
        supplierName: 'Tech Supplies Inc.',
        paymentTerms: 'Net 30',
        deliveryInstructions: 'Deliver to warehouse A, attention: John Doe.',
        poDescription: 'Monthly office supplies purchase.',
        itemDetails: [
          { itemName: 'Laptop', lastPrice: 1200 },
          { itemName: 'Monitor', lastPrice: 300 },
        ],
      },
      {
        supplierName: 'Office Depot',
        paymentTerms: 'Due upon receipt',
        deliveryInstructions: 'Deliver to front desk.',
        poDescription: 'Emergency printer ink refill.',
        itemDetails: [
          { itemName: 'Printer Ink', lastPrice: 50 },
        ],
      },
      {
        supplierName: 'Global Electronics',
        paymentTerms: 'Net 60',
        deliveryInstructions: 'Contact finance upon delivery.',
        poDescription: 'Annual hardware upgrade.',
        itemDetails: [
          { itemName: 'Server Rack', lastPrice: 2500 },
          { itemName: 'SSD Drive', lastPrice: 150 },
        ],
      },
    ];

    const relevantHistoricalData = dummyHistoricalData.filter(po =>
      po.itemDetails.some(detail => input.itemNames.includes(detail.itemName))
    );

    return relevantHistoricalData;
  }
);

/**
 * Genkit Prompt for drafting the purchase order intelligently.
 * It uses the approved request data and historical PO data (from the tool) to pre-fill PO fields.
 */
const intelligentPODraftingPrompt = ai.definePrompt({
  name: 'intelligentPODraftingPrompt',
  input: { schema: IntelligentPODraftingInputSchema.extend({ historicalPOData: HistoricalPODataSchema }) },
  output: { schema: IntelligentPODraftingOutputSchema },
  tools: [getHistoricalPOData], // Make the historical data tool available to the LLM
  prompt: `You are an intelligent purchasing agent assistant. Your goal is to draft a Purchase Order (PO) by pre-filling key fields based on an approved purchase request and provided historical purchase order data.

Approved Purchase Request Details:
Request ID: {{{requestId}}}
Applicant ID: {{{applicantId}}}
Description: {{{requestDescription}}}
Estimated Total Cost: {{{estimatedTotalCost}}}
Items:
{{#each items}}
- Name: {{{name}}}, Quantity: {{{quantity}}}, Estimated Unit Cost: {{{unitCost}}}
{{/each}}

Historical Purchase Order Data:
{{#if historicalPOData}}
{{#each historicalPOData}}
  - Supplier: {{{supplierName}}}, Payment Terms: {{{paymentTerms}}}, Delivery Instructions: {{{deliveryInstructions}}}, PO Description: {{{poDescription}}}
    Items Purchased Historically:
    {{#each itemDetails}}
    - Item: {{{itemName}}}, Last Price: {{{lastPrice}}}
    {{/each}}
{{/each}}
{{else}}
No relevant historical data found.
{{/if}}

Based on the approved purchase request and the historical data, suggest the most appropriate values for the following Purchase Order fields. If historical data is scarce or not directly relevant, use your best judgment based on the request details. Provide a justification for your choices if applicable.

Consider the items being requested, previous suppliers for similar items, common payment terms, and delivery practices.`,
});

/**
 * Genkit Flow for intelligent Purchase Order drafting.
 * It orchestrates fetching historical data and then uses an LLM to generate pre-filled PO fields.
 */
const intelligentPODraftingFlow = ai.defineFlow(
  {
    name: 'intelligentPODraftingFlow',
    inputSchema: IntelligentPODraftingInputSchema,
    outputSchema: IntelligentPODraftingOutputSchema,
  },
  async (input) => {
    const itemNames = input.items.map(item => item.name);

    // Fetch historical data using the defined tool
    const historicalPOData = await getHistoricalPOData({
      applicantId: input.applicantId,
      itemNames: itemNames,
    });

    // Call the prompt with the request details and the fetched historical data
    const { output } = await intelligentPODraftingPrompt({ ...input, historicalPOData });
    return output!;
  }
);

/**
 * Initiates the intelligent drafting of a Purchase Order based on an approved request.
 * This function fetches relevant historical data and then leverages an AI model
 * to suggest pre-filled fields for the new Purchase Order.
 * @param input The details of the approved purchase request.
 * @returns The intelligently drafted Purchase Order fields.
 */
export async function intelligentPODrafting(input: IntelligentPODraftingInput): Promise<IntelligentPODraftingOutput> {
  return intelligentPODraftingFlow(input);
}
