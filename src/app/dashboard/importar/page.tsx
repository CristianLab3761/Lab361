'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, File as FileIcon, X, Loader2 } from 'lucide-react';
import Papa from 'papaparse';

import { Header } from '@/components/app/header';
import { PageHeader } from '@/components/app/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAppContext, AdminItemType } from '@/context/app-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ImportarPage() {
  const { toast } = useToast();
  const { currentUser, addMultipleAdminItems } = useAppContext();

  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importType, setImportType] = useState<AdminItemType | ''>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type !== 'text/csv') {
        toast({
          variant: "destructive",
          title: "Archivo no válido",
          description: "Por favor, selecciona un archivo con formato CSV.",
        });
        return;
      }
      setFile(selectedFile);
      setParsedData([]);
      setHeaders([]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setParsedData([]);
    setHeaders([]);
    setImportType('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleParse = () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'No se ha seleccionado ningún archivo',
        description: 'Por favor, selecciona un archivo CSV para continuar.',
      });
      return;
    }

    setIsLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      newline: '', // Auto-detect newlines
      complete: (results) => {
        setIsLoading(false);

        // If data is parsed, we consider it a success, even with minor errors.
        if (results.data.length > 0) {
            setHeaders(results.meta.fields || []);
            setParsedData(results.data);
            
            const description = results.errors.length > 0
                ? `Se han extraído ${results.data.length} filas. Se encontraron ${results.errors.length} error(es) no críticos.`
                : `Se han extraído ${results.data.length} filas del archivo.`;

            toast({
                title: 'Archivo procesado con éxito',
                description: description,
            });
        } else if (results.errors.length > 0) {
          // No data was parsed, so the errors are critical.
          const firstError = results.errors[0];
          const errorMessage = firstError.row !== undefined && firstError.row !== null
            ? `Error en fila ${firstError.row + 1}: ${firstError.message}`
            : firstError.message;

          toast({
            variant: "destructive",
            title: "Error al procesar el archivo CSV",
            description: errorMessage,
          });
        } else {
            // No data and no errors means an empty file.
            setHeaders([]);
            setParsedData([]);
            toast({
                title: 'Archivo vacío',
                description: 'El archivo seleccionado no contiene datos.',
            });
        }
      },
      error: (error: any) => {
        setIsLoading(false);
        toast({
          variant: 'destructive',
          title: 'Error fatal al procesar el archivo',
          description: error.message,
        });
      },
    });
  };

  const handleImportData = async () => {
    if (!importType) {
        toast({
            variant: "destructive",
            title: "Selecciona un tipo de dato",
            description: "Debes elegir qué tipo de datos estás importando.",
        });
        return;
    }

    if (parsedData.length === 0) {
        toast({
            variant: "destructive",
            title: "No hay datos para importar",
            description: "El archivo procesado no contiene filas de datos válidas.",
        });
        return;
    }

    const requiredHeaders: { [key in AdminItemType]: string[] } = {
        proveedores: ['name'],
        cuentas: ['name', 'code'],
        presupuestos: ['name', 'monto'],
        centrosNegocios: ['name'],
        centrosCostos: ['name', 'code'],
    };

    const missingHeaders = requiredHeaders[importType].filter(h => !headers.includes(h));

    if (missingHeaders.length > 0) {
        toast({
            variant: "destructive",
            title: "Cabeceras incorrectas",
            description: `Columnas requeridas para '${importType}': ${requiredHeaders[importType].join(', ')}. Faltan: ${missingHeaders.join(', ')}.`,
        });
        return;
    }

    setIsImporting(true);
    try {
        const dataToImport = parsedData.map(row => {
            if (importType === 'presupuestos' && row.monto) {
                const monto = parseFloat(String(row.monto).replace(/[^0-9.-]+/g,""));
                return { ...row, monto: isNaN(monto) ? 0 : monto };
            }
            return row;
        });

        await addMultipleAdminItems(importType, dataToImport);
        handleRemoveFile(); // Reset UI after successful import
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error durante la importación",
            description: error.message || "Ocurrió un problema al guardar los datos.",
        });
    } finally {
        setIsImporting(false);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const droppedFile = event.dataTransfer.files[0];
       if (droppedFile.type !== 'text/csv') {
        toast({
          variant: "destructive",
          title: "Archivo no válido",
          description: "Por favor, suelta un archivo con formato CSV.",
        });
        return;
      }
      setFile(droppedFile);
      setParsedData([]);
      setHeaders([]);
      event.dataTransfer.clearData();
    }
  };


  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };


  if (!currentUser || currentUser.role !== 'compras') {
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
      <PageHeader title="Importación Masiva" description="Carga datos históricos desde un archivo CSV para extraer sus datos." />
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cargar Archivo CSV</CardTitle>
            <CardDescription>
              Selecciona o arrastra un archivo CSV para extraer y visualizar su contenido.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            {!file ? (
              <div
                className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={handleButtonClick}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <UploadCloud className="h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Arrastra y suelta tu archivo aquí, o haz clic para seleccionar.
                </p>
                <Button variant="outline" size="sm" className="pointer-events-none">
                  Seleccionar Archivo
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
                 <div className="flex items-center gap-3">
                    <FileIcon className="h-6 w-6 text-muted-foreground" />
                    <div className="flex flex-col">
                        <span className="font-medium text-sm">{file.name}</span>
                        <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</span>
                    </div>
                 </div>
                 <Button variant="ghost" size="icon" onClick={handleRemoveFile}>
                    <X className="h-4 w-4" />
                 </Button>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleParse} disabled={!file || isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Extrayendo Datos...' : 'Extraer Datos del CSV'}
            </Button>
          </CardFooter>
        </Card>

        {parsedData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Vista Previa de Datos</CardTitle>
              <CardDescription>
                Mostrando las primeras 100 filas del archivo &quot;{file?.name}&quot;.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {headers.map(header => <TableHead key={header}>{header}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 100).map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {headers.map(header => <TableCell key={`${rowIndex}-${header}`}>{row[header]}</TableCell>)}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
             <CardFooter className="flex-col items-stretch gap-4 border-t pt-6 md:flex-row">
                <div className="flex-1">
                <Select value={importType} onValueChange={(value) => setImportType(value as AdminItemType)}>
                    <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo de dato a importar" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="proveedores">Proveedores</SelectItem>
                    <SelectItem value="cuentas">Cuentas Contables</SelectItem>
                    <SelectItem value="presupuestos">Presupuestos</SelectItem>
                    <SelectItem value="centrosNegocios">Centros de Negocios</SelectItem>
                    <SelectItem value="centrosCostos">Centros de Costos</SelectItem>
                    </SelectContent>
                </Select>
                </div>
                <Button onClick={handleImportData} disabled={!importType || isImporting} className="w-full md:w-auto">
                {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Importar {parsedData.length} registros
                </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </main>
  );
}
