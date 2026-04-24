'use client';

import React, { useState, useRef, useMemo } from 'react';
import { UploadCloud, File as FileIcon, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
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

  // Pagination for preview
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = useMemo(() => Math.ceil(parsedData.length / itemsPerPage), [parsedData.length]);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return parsedData.slice(start, start + itemsPerPage);
  }, [parsedData, currentPage]);

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
      setCurrentPage(1);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setParsedData([]);
    setHeaders([]);
    setImportType('');
    setCurrentPage(1);
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
    Papa.parse(file as any, {
      header: true,
      skipEmptyLines: 'greedy',
      delimiter: "", // Auto-detect delimiter
      complete: (results: any) => {
        setIsLoading(false);

        // If data is parsed, we consider it a success, even with minor errors.
        if (results.data.length > 0) {
          setHeaders(results.meta.fields || []);
          setParsedData(results.data);
          setCurrentPage(1);

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

    const hasValidSupplierName = headers.includes('name') || headers.includes('Nombre de Fantasia') || headers.includes('RAZON SOCIAL');

    if (importType === 'Proveedores' && !hasValidSupplierName) {
      toast({
        variant: "destructive",
        title: "Cabeceras incorrectas",
        description: "Para proveedores, el archivo debe contener al menos una columna llamada 'name', 'Nombre de Fantasia' o 'RAZON SOCIAL'.",
      });
      return;
    }

    if (importType !== 'Proveedores') {
      const requiredHeaders: { [key in string]: string[] } = {
        CuentasPresupuestos: ['name', 'code'], 
        presupuestos: ['name', 'monto'],
        CentrosDeNegocios: ['name'],
        centrosCostos: ['name'], 
        ListaDeMateriales: ['Código', 'Descripcion del material'],
        Requisiciones: ['N° Requisición', 'Solicitante', 'Item', 'Unidades', 'Precio Unitario'],
      };

      const isCostCenter = importType === 'centrosCostos';
      const hasValidCostCenterHeader = headers.includes('name') || headers.includes('Centros de Costo');

      if (isCostCenter && !hasValidCostCenterHeader) {
        toast({
          variant: "destructive",
          title: "Cabeceras incorrectas",
          description: "Para centros de costos, el archivo debe contener una columna llamada 'name' o 'Centros de Costo'.",
        });
        return;
      }

      const isCuentas = importType === 'CuentasPresupuestos';
      const hasValidCuentasHeader = headers.includes('name') || headers.includes('Cuentas Presupuesto');

      if (isCuentas && !hasValidCuentasHeader) {
        toast({
          variant: "destructive",
          title: "Cabeceras incorrectas",
          description: "Para cuentas presupuesto, el archivo debe contener una columna llamada 'name' o 'Cuentas Presupuesto'.",
        });
        return;
      }

      if (importType === 'ListaDeMateriales') {
        const hasCodigo = headers.includes('Código') || headers.includes('codigo');
        const hasDescripcion = headers.includes('Descripcion del material') || headers.includes('descripcion');

        if (!hasCodigo || !hasDescripcion) {
          toast({
            variant: "destructive",
            title: "Cabeceras incorrectas",
            description: "Para lista de materiales, el archivo debe contener las columnas 'Código' y 'Descripcion del material'.",
          });
          return;
        }
      }

      if (!isCostCenter && !isCuentas) {
        const missingHeaders = requiredHeaders[importType].filter(h => !headers.includes(h));

        if (missingHeaders.length > 0) {
          toast({
            variant: "destructive",
            title: "Cabeceras incorrectas",
            description: `Columnas requeridas para '${importType}': ${requiredHeaders[importType].join(', ')}. Faltan: ${missingHeaders.join(', ')}.`,
          });
          return;
        }
      }
    }

    setIsImporting(true);
    try {
      const dataToImport = parsedData.map(row => {
        if (importType === 'presupuestos' && row.monto) {
          const monto = parseFloat(String(row.monto).replace(/[^0-9.-]+/g, ""));
          return { ...row, monto: isNaN(monto) ? 0 : monto };
        }
        if (importType === 'CuentasPresupuestos') {
          return {
            name: row['Cuentas Presupuesto'] || row['name'] || 'Sin Nombre',
            code: row['code'] || '',
            ...row,
          };
        }
        if (importType === 'Proveedores') {
          return {
            name: row['name'] || row['Nombre de Fantasia'] || row['RAZON SOCIAL'] || 'Sin Nombre',
            razonSocial: row['RAZON SOCIAL'] || '',
            direccion: row['DIRECCION'] || '',
            rut: row['RUT'] || '',
            ciudad: row['CIUDAD'] || '',
            pais: row['PAÌS'] || row['PAÍS'] || row['PAIS'] || '',
            telefono: row['TELEFONO'] || '',
            email: row['EMAIL'] || '',
            numeroCuenta: row['NUMERO DE CUENTA'] || '',
            codigoBanco: row['CODIGO DE BANCO'] || '',
            banco: row['BANCO'] || '',
            ...row,
          };
        }
        if (importType === 'centrosCostos') {
          return {
            name: row['Centros de Costo'] || row['name'] || 'Sin Nombre',
            code: row['code'] || '',
            ...row,
          };
        }
        if (importType === 'CentrosDeNegocios') {
            return {
              name: row['name'] || 'Sin Nombre',
              ...row,
            };
          }
        if (importType === 'ListaDeMateriales') {
          return {
            codigo: row['Código'] || row['codigo'] || '',
            descripcion: row['Descripcion del material'] || row['descripcion'] || '',
            ...row,
          };
        }
        return row;
      });

      // Special handling for Requisiciones: group rows by N° Requisición
      let finalData = dataToImport;
      if (importType === 'Requisiciones') {
        const solMap = new Map<string, any>();

        dataToImport.forEach((row, rowIndex) => {
          const reqId = row['N° Requisición'] || `import-req-${rowIndex}`;
          
          if (!solMap.has(reqId)) {
            // Combine Fecha and Hora for createdAt
            let createdAt = new Date().toISOString();
            if (row['Fecha']) {
              const [day, month, year] = String(row['Fecha']).split('/').map(Number);
              const [hour, minute] = String(row['Hora'] || '00:00').split(':').map(Number);
              if (day && month && year) {
                try {
                  createdAt = new Date(year, month - 1, day, hour || 0, minute || 0).toISOString();
                } catch (e) {
                  // Fallback to now
                }
              }
            }

            solMap.set(reqId, {
              id: reqId,
              solicitanteName: row['Solicitante'] || 'Importado',
              cargo: row['Cargo'] || '',
              centroCostos: row['Centro de Costos'] || '',
              centroNegocios: row['Centro de Negocios'] || '',
              proveedor: row['Proveedor'] || '',
              autorizadoPor: row['Autorizado por'] || '',
              fechaEntrega: row['Fecha Entrega'] || '',
              createdAt,
              status: (row['Estatus'] || 'pendiente').toLowerCase(),
              fechaEstatus: row['Fecha Estatus'] || new Date().toISOString(),
              refOC: row['Ref OC'] || '',
              items: [],
              totalEstimatedCost: 0,
            });
          }

          const currentSol = solMap.get(reqId);
          const quantity = parseFloat(String(row['Unidades']).replace(/,/g, '')) || 0;
          const estimatedCost = parseFloat(String(row['Precio Unitario']).replace(/,/g, '')) || 0;
          
          currentSol.items.push({
            id: `item-${currentSol.items.length}`,
            name: row['Item'] || '',
            codigoMaterial: row['Código Material'] || '',
            quantity,
            estimatedCost,
            descripcion: row['Descripción'] || '',
            cuentaPresupuesto: row['Cuenta Presupuesto'] || '',
          });

          currentSol.totalEstimatedCost += quantity * estimatedCost;
        });

        finalData = Array.from(solMap.values());
      }

      await addMultipleAdminItems(importType, finalData);
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
      setCurrentPage(1);
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
                Mostrando {parsedData.length > 0 ? `${(currentPage - 1) * itemsPerPage + 1} a ${Math.min(currentPage * itemsPerPage, parsedData.length)}` : '0'} de {parsedData.length} registros del archivo &quot;{file?.name}&quot;.
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
                    {paginatedData.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {headers.map(header => <TableCell key={`${rowIndex}-${header}`}>{String(row[header] || '')}</TableCell>)}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 bg-white px-4 py-3 sm:px-6 mt-4">
                  <div className="flex flex-1 justify-between sm:hidden">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-slate-700">
                        Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="font-medium">{Math.min(currentPage * itemsPerPage, parsedData.length)}</span> de <span className="font-medium">{parsedData.length}</span> resultados
                      </p>
                    </div>
                    <div>
                      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        >
                          <span className="sr-only">Anterior</span>
                          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        
                        <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 focus:outline-offset-0">
                          {currentPage} de {totalPages}
                        </span>

                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                        >
                          <span className="sr-only">Siguiente</span>
                          <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-4 border-t pt-6 md:flex-row">
              <div className="flex-1">
                <Select value={importType} onValueChange={(value) => setImportType(value as AdminItemType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo de dato a importar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Proveedores">Proveedores</SelectItem>
                    <SelectItem value="CuentasPresupuestos">Cuentas Presupuesto</SelectItem>
                    <SelectItem value="presupuestos">Presupuestos</SelectItem>
                    <SelectItem value="CentrosDeNegocios">Centros de Negocios</SelectItem>
                    <SelectItem value="centrosCostos">Centros de Costos</SelectItem>
                    <SelectItem value="ListaDeMateriales">Lista de Materiales</SelectItem>
                    <SelectItem value="Requisiciones">Requisiciones</SelectItem>
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
