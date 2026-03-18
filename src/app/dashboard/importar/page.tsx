'use client';
import { UploadCloud } from 'lucide-react';

import { Header } from '@/components/app/header';
import { PageHeader } from '@/components/app/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/app-context';

export default function ImportarPage() {
  const { toast } = useToast();
  const { currentUser } = useAppContext();

  const handleImport = () => {
    toast({
      title: "Importación Simulada",
      description: "En un entorno real, aquí se procesaría un archivo CSV o Excel para importar datos masivamente.",
    });
  };

  if (currentUser.role !== 'compras') {
    return (
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Header breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Importar' }]} />
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-20">
                <div className="flex flex-col items-center gap-1 text-center">
                  <h3 className="text-2xl font-bold tracking-tight">Acceso Restringido</h3>
                  <p className="text-sm text-muted-foreground">
                    Esta sección solo está disponible para el equipo de compras.
                  </p>
                </div>
              </div>
        </main>
    );
  }

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Importar' }]} />
      <PageHeader title="Importación Masiva" description="Carga datos históricos desde archivos CSV o Excel." />
      <div className="grid place-items-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Cargar Registros Históricos</CardTitle>
            <CardDescription>
              Selecciona un archivo para migrar tus órdenes de compra antiguas a Firestore.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center">
              <UploadCloud className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Arrastra y suelta tu archivo aquí, o haz clic para seleccionar.
              </p>
              <Button variant="outline" size="sm" onClick={() => toast({ title: "Función no implementada", description: "La selección de archivos es solo una demostración."})}>
                Seleccionar Archivo
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleImport}>
              Iniciar Importación
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
