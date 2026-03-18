'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { MoreHorizontal, CheckCircle, XCircle, FileCog, Bot, ChevronDown, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { useAppContext } from '@/context/app-context';
import type { Solicitud } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

import { summarizePurchaseRequest, PurchaseRequestSummarizerInput } from '@/ai/flows/purchase-request-summarizer-flow';
import { intelligentPODrafting, IntelligentPODraftingInput } from '@/ai/flows/intelligent-po-drafting-flow';

const statusStyles: { [key: string]: string } = {
  pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  aprobada: 'bg-blue-100 text-blue-800 border-blue-200',
  rechazada: 'bg-red-100 text-red-800 border-red-200',
  procesada: 'bg-green-100 text-green-800 border-green-200',
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function SummaryDisplay({ summary }: { summary: Solicitud['summary'] }) {
  if (!summary) return null;
  return (
    <Card className="mt-2 bg-blue-50/50 border-blue-200">
      <CardHeader className="flex-row items-start gap-4 space-y-0">
        <div className="flex-shrink-0">
          <Bot className="h-6 w-6 text-primary" />
        </div>
        <div>
          <CardTitle className="text-base">Resumen Inteligente</CardTitle>
          <CardDescription>{summary.summary}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {summary.keyPoints.map((point, i) => (
            <li key={i} className={summary.anomaliesDetected && point.includes('significativamente') ? 'font-semibold text-amber-700' : ''}>{point}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function GeneratePODialog({ solicitud, onOpenChange, open }: { solicitud: Solicitud, onOpenChange: (open: boolean) => void, open: boolean }) {
  const { addOrdenCompra } = useAppContext();
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [draft, setDraft] = React.useState<Solicitud['draftPO'] | null>(solicitud.draftPO || null);

  React.useEffect(() => {
    if (open && !draft) {
      const generateDraft = async () => {
        setIsGenerating(true);
        const poInput: IntelligentPODraftingInput = {
          requestId: solicitud.id,
          applicantId: solicitud.solicitanteId,
          requestDescription: `Solicitud de ${solicitud.department} por ${solicitanteName}`,
          items: solicitud.items.map(i => ({ name: i.name, quantity: i.quantity, unitCost: i.estimatedCost })),
          estimatedTotalCost: solicitud.totalEstimatedCost,
        };
        const result = await intelligentPODrafting(poInput);
        setDraft(result);
        setIsGenerating(false);
      };
      generateDraft();
    }
  }, [open, draft, solicitud]);

  const handleConfirm = () => {
    if (!draft) return;
    const totalCost = solicitud.items.reduce((acc, item) => acc + item.quantity * item.estimatedCost, 0); // Use estimated for now
    addOrdenCompra({
      solicitudId: solicitud.id,
      supplierName: draft.supplierName,
      paymentTerms: draft.paymentTerms,
      deliveryInstructions: draft.deliveryInstructions,
      poDescription: draft.poDescription,
      items: solicitud.items.map(i => ({ ...i, unitCost: i.estimatedCost })),
      totalCost,
    }, solicitud.id);
    onOpenChange(false);
  };
  
  const {solicitanteName} = solicitud;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            Sugerencia de Orden de Compra
          </DialogTitle>
          <DialogDescription>
            La IA ha generado una sugerencia para la OC basada en datos históricos.
          </DialogDescription>
        </DialogHeader>
        {isGenerating && (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Analizando historial...</p>
          </div>
        )}
        {draft && (
          <div className="space-y-4 py-4 text-sm">
            <div className="grid grid-cols-3 items-center">
              <span className="font-semibold text-muted-foreground">Proveedor</span>
              <span className="col-span-2">{draft.supplierName}</span>
            </div>
            <div className="grid grid-cols-3 items-center">
              <span className="font-semibold text-muted-foreground">Condiciones de Pago</span>
              <span className="col-span-2">{draft.paymentTerms}</span>
            </div>
            <div className="grid grid-cols-3 items-center">
              <span className="font-semibold text-muted-foreground">Instrucciones</span>
              <span className="col-span-2">{draft.deliveryInstructions}</span>
            </div>
            <div className="space-y-1">
              <span className="font-semibold text-muted-foreground">Descripción de OC</span>
              <p className="rounded-md border bg-muted/50 p-2">{draft.poDescription}</p>
            </div>
             {draft.justification && (
              <div className="space-y-1">
                <span className="font-semibold text-muted-foreground">Justificación</span>
                <p className="rounded-md border bg-muted/50 p-2 text-xs">{draft.justification}</p>
              </div>
            )}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={isGenerating || !draft}>
            Confirmar y Generar OC
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RequestRow({ solicitud }: { solicitud: Solicitud }) {
  const { currentUser, updateSolicitud, getHistoricalDataForItems } = useAppContext();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = React.useState(false);
  const [summary, setSummary] = React.useState<Solicitud['summary'] | undefined>(solicitud.summary);
  const [showConfirm, setShowConfirm] = React.useState<'approve' | 'reject' | null>(null);
  const [showGeneratePO, setShowGeneratePO] = React.useState(false);

  const handleToggleExpand = async () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    if (newExpandedState && !summary) {
      setIsSummaryLoading(true);
      const summaryInput: PurchaseRequestSummarizerInput = {
        currentRequest: {
          id: solicitud.id,
          requesterName: solicitud.solicitanteName,
          department: solicitud.department,
          items: solicitud.items.map(item => ({ name: item.name, quantity: item.quantity, estimatedCost: item.estimatedCost })),
          totalEstimatedCost: solicitud.totalEstimatedCost,
        },
        historicalData: getHistoricalDataForItems(solicitud.items),
      };
      const result = await summarizePurchaseRequest(summaryInput);
      setSummary(result);
      updateSolicitud(solicitud.id, { summary: result });
      setIsSummaryLoading(false);
    }
  };

  const handleStatusChange = (status: 'aprobada' | 'rechazada') => {
    updateSolicitud(solicitud.id, { status });
    setShowConfirm(null);
  };

  return (
    <>
      <TableRow className="bg-background">
        <TableCell>
          <Button variant="ghost" size="icon" onClick={handleToggleExpand}>
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </TableCell>
        <TableCell className="font-medium">{solicitud.id.toUpperCase()}</TableCell>
        <TableCell>{solicitud.solicitanteName}</TableCell>
        <TableCell className="hidden md:table-cell">{solicitud.department}</TableCell>
        <TableCell className="hidden md:table-cell">
          {format(parseISO(solicitud.createdAt), "dd MMM yyyy", { locale: es })}
        </TableCell>
        <TableCell>{currencyFormatter.format(solicitud.totalEstimatedCost)}</TableCell>
        <TableCell>
          <Badge className={cn("border", statusStyles[solicitud.status])} variant="outline">
            {solicitud.status.charAt(0).toUpperCase() + solicitud.status.slice(1)}
          </Badge>
        </TableCell>
        <TableCell>
          {currentUser.role === 'compras' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button aria-haspopup="true" size="icon" variant="ghost">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {solicitud.status === 'pendiente' && (
                  <>
                    <DropdownMenuItem onSelect={() => setShowConfirm('approve')}>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Aprobar
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setShowConfirm('reject')}>
                      <XCircle className="mr-2 h-4 w-4 text-red-500" /> Rechazar
                    </DropdownMenuItem>
                  </>
                )}
                {solicitud.status === 'aprobada' && (
                  <DropdownMenuItem onSelect={() => setShowGeneratePO(true)}>
                    <FileCog className="mr-2 h-4 w-4" /> Generar OC
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow className="bg-card hover:bg-card">
          <TableCell colSpan={8} className="p-0">
            <div className="p-4">
              <h4 className="font-semibold mb-2">Detalles de la Solicitud</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {solicitud.items.map(item => (
                  <li key={item.id} className="flex justify-between">
                    <span>{item.quantity} x {item.name}</span>
                    <span>{currencyFormatter.format(item.estimatedCost * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              {solicitud.comments && (
                  <div className="mt-2 text-sm">
                      <h5 className="font-semibold">Comentarios del solicitante:</h5>
                      <p className="text-muted-foreground p-2 bg-muted/50 rounded-md">{solicitud.comments}</p>
                  </div>
              )}
              {isSummaryLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <SummaryDisplay summary={summary} />
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
      <AlertDialog open={!!showConfirm} onOpenChange={() => setShowConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción cambiará el estado de la solicitud a '{showConfirm}'. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleStatusChange(showConfirm!)}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {solicitud.status === 'aprobada' && (
        <GeneratePODialog open={showGeneratePO} onOpenChange={setShowGeneratePO} solicitud={solicitud} />
      )}
    </>
  );
}

export function RequestsTable({ filterStatus, solicitanteId }: { filterStatus?: Solicitud['status']; solicitanteId?: string }) {
  const { solicitudes, currentUser } = useAppContext();

  const filteredSolicitudes = React.useMemo(() => {
    let items = solicitudes;
    if (filterStatus) {
      items = items.filter(s => s.status === filterStatus);
    }
    if (solicitanteId) {
      items = items.filter(s => s.solicitanteId === solicitanteId);
    }
    return items.sort((a, b) => parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime());
  }, [solicitudes, filterStatus, solicitanteId]);
  
  if(filteredSolicitudes.length === 0){
    return (
        <div className="text-center py-10 text-muted-foreground">
            No hay solicitudes que coincidan con los filtros.
        </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12"></TableHead>
          <TableHead>ID</TableHead>
          <TableHead>Solicitante</TableHead>
          <TableHead className="hidden md:table-cell">Departamento</TableHead>
          <TableHead className="hidden md:table-cell">Fecha</TableHead>
          <TableHead>Total Estimado</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead><span className="sr-only">Acciones</span></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredSolicitudes.map(solicitud => (
          <RequestRow key={solicitud.id} solicitud={solicitud} />
        ))}
      </TableBody>
    </Table>
  );
}
