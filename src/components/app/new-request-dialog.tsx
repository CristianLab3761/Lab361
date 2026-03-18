'use client';

import { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/context/app-context';
import { ScrollArea } from '@/components/ui/scroll-area';

const itemSchema = z.object({
  name: z.string().min(1, 'El nombre del ítem es requerido'),
  quantity: z.coerce.number().int().min(1, 'La cantidad debe ser al menos 1'),
  estimatedCost: z.coerce.number().min(0.01, 'El costo debe ser positivo'),
});

const formSchema = z.object({
  department: z.string().min(1, 'El departamento es requerido'),
  items: z.array(itemSchema).min(1, 'Debe agregar al menos un ítem'),
  comments: z.string().optional(),
});

type NewRequestFormValues = z.infer<typeof formSchema>;

export function NewRequestDialog() {
  const [open, setOpen] = useState(false);
  const { addSolicitud } = useAppContext();

  const form = useForm<NewRequestFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      department: '',
      items: [{ name: '', quantity: 1, estimatedCost: 0 }],
      comments: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const onSubmit = (data: NewRequestFormValues) => {
    const totalEstimatedCost = data.items.reduce(
      (acc, item) => acc + item.quantity * item.estimatedCost,
      0
    );
    addSolicitud({
      ...data,
      status: 'pendiente',
      items: data.items.map((item, index) => ({ ...item, id: `new-item-${index}` })),
      totalEstimatedCost,
    });
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva Solicitud
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Crear Nueva Solicitud de Compra</DialogTitle>
          <DialogDescription>
            Complete los detalles de su solicitud. Puede agregar múltiples ítems.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <ScrollArea className="h-96 pr-6">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department" className="text-right">
                  Departamento
                </Label>
                <Input
                  id="department"
                  {...form.register('department')}
                  className="col-span-3"
                />
              </div>
              {form.formState.errors.department && <p className="col-span-4 text-right text-sm text-destructive">{form.formState.errors.department.message}</p>}

              <div>
                <Label className="text-right font-semibold">Ítems</Label>
                <div className="mt-2 space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 items-start gap-4">
                      <div className="col-span-5">
                        <Label htmlFor={`items.${index}.name`} className="sr-only">Nombre</Label>
                        <Input
                          {...form.register(`items.${index}.name`)}
                          placeholder="Nombre del ítem"
                        />
                      </div>
                      <div className="col-span-3">
                         <Label htmlFor={`items.${index}.quantity`} className="sr-only">Cantidad</Label>
                        <Input
                          type="number"
                          {...form.register(`items.${index}.quantity`)}
                          placeholder="Cantidad"
                        />
                      </div>
                      <div className="col-span-3">
                        <Label htmlFor={`items.${index}.estimatedCost`} className="sr-only">Costo Estimado</Label>
                        <Input
                          type="number"
                          step="0.01"
                          {...form.register(`items.${index}.estimatedCost`)}
                          placeholder="Costo Unitario"
                        />
                      </div>
                      <div className="col-span-1 flex items-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                       {form.formState.errors.items?.[index]?.name && <p className="col-span-5 text-sm text-destructive">{form.formState.errors.items[index]?.name?.message}</p>}
                       {form.formState.errors.items?.[index]?.quantity && <p className="col-span-3 col-start-6 text-sm text-destructive">{form.formState.errors.items[index]?.quantity?.message}</p>}
                       {form.formState.errors.items?.[index]?.estimatedCost && <p className="col-span-3 col-start-9 text-sm text-destructive">{form.formState.errors.items[index]?.estimatedCost?.message}</p>}
                    </div>
                  ))}
                </div>
                {form.formState.errors.items && !form.formState.errors.items.root && <p className="mt-2 text-sm text-destructive">{form.formState.errors.items.message}</p>}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => append({ name: '', quantity: 1, estimatedCost: 0 })}
                className="w-full"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar Ítem
              </Button>
              
              <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="comments" className="text-right">
                  Comentarios
                </Label>
                 <textarea
                  id="comments"
                  {...form.register('comments')}
                  className="col-span-3 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Instrucciones especiales, justificación, etc."
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button type="submit">Enviar Solicitud</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
