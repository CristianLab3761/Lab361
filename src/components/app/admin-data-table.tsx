'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Loader2, Save, X, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppContext, AdminItemType } from '@/context/app-context';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AdminDataTableProps<T extends { id: string; [key: string]: any }> {
  title: string;
  description: string;
  itemType: AdminItemType;
  items: T[];
  columns: { key: keyof T; header: string }[];
  formFields: { key: keyof T, placeholder: string, type?: 'text' | 'number' | 'checkbox-group', options?: string[] }[];
}

export function AdminDataTable<T extends { id: string; [key: string]: any }>({
  title,
  description,
  itemType,
  items,
  columns,
  formFields
}: AdminDataTableProps<T>) {
  const { addAdminItem, removeAdminItem, updateAdminItem } = useAppContext();
  const [newItem, setNewItem] = useState<Partial<T>>({});
  const [isAdding, setIsAdding] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<T>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // --- FILTERING LOGIC ---
  const filteredItems = items.filter(item => {
    if (!searchTerm) return true;
    
    return Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 on search
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredItems.length, currentPage, totalPages]);

  // --- ADD LOGIC ---
  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setNewItem({
      ...newItem,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    });
  };

  const handleAddCheckboxChange = (fieldKey: keyof T, option: string, checked: boolean) => {
    const currentValues = (newItem[fieldKey] as string[]) || [];
    const newValues = checked 
      ? [...currentValues, option]
      : currentValues.filter(v => v !== option);
    
    setNewItem({
      ...newItem,
      [fieldKey]: newValues as any,
    });
  };

  const handleAddItem = async () => {
    if (formFields.some(field => !newItem[field.key])) {
      alert('Por favor, complete los campos principales.');
      return;
    }
    setIsAdding(true);
    await addAdminItem(itemType, newItem as Omit<T, 'id'>);
    setNewItem({});
    setIsAdding(false);
    setIsDialogOpen(false);
  };

  // --- EDIT LOGIC ---
  const startEditing = (item: T) => {
    setEditingId(item.id);
    setEditData(item);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setEditData({
      ...editData,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    });
  };

  const handleEditCheckboxChange = (fieldKey: keyof T, option: string, checked: boolean) => {
    const currentValues = (editData[fieldKey] as string[]) || [];
    const newValues = checked 
      ? [...currentValues, option]
      : currentValues.filter(v => v !== option);
    
    setEditData({
      ...editData,
      [fieldKey]: newValues as any,
    });
  };

  const handleSaveEdit = async (id: string) => {
    setIsSaving(true);
    await updateAdminItem(itemType, id, editData);
    setIsSaving(false);
    setEditingId(null);
  };

  return (
    <div className="flex flex-col h-full bg-white/50 rounded-xl">
      <CardHeader className="border-b border-slate-100 pb-4 bg-white/40 rounded-t-xl px-6 pt-6 mb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-slate-800">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar registros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/60 border-slate-200 focus-visible:ring-primary/20 h-10"
              />
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white shadow-md">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Registro
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl lg:max-w-5xl max-h-[90vh] p-0 overflow-hidden border-0 shadow-2xl">
              <DialogHeader className="p-6 bg-slate-50 border-b border-slate-100">
                <DialogTitle className="text-xl font-bold text-slate-900">Añadir Nuevo {title.replace('Gestionar ', '').slice(0, -1)}</DialogTitle>
                <DialogDescription>
                  Complete todos los campos necesarios para agregar un nuevo registro al catálogo.
                </DialogDescription>
              </DialogHeader>
              
              <ScrollArea className="max-h-[65vh] p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                  {formFields.map(field => {
                    const isFullWidth = field.type === 'checkbox-group' || String(field.key).toLowerCase().includes('observaciones');
                    
                    return (
                      <div key={String(field.key)} className={cn("space-y-2", isFullWidth && "md:col-span-2 lg:col-span-3")}>
                        <Label htmlFor={`add-${String(field.key)}`} className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {field.placeholder}
                        </Label>
                        
                        {field.type === 'checkbox-group' ? (
                          <div className="p-3 border border-slate-200 rounded-lg bg-slate-50/30">
                            <div className="flex flex-wrap gap-x-6 gap-y-3">
                              {field.options?.map(option => (
                                <div key={option} className="flex items-center space-x-2">
                                  <Checkbox 
                                    id={`add-${String(field.key)}-${option}`} 
                                    checked={((newItem[field.key] as string[]) || []).includes(option)}
                                    onCheckedChange={(checked) => handleAddCheckboxChange(field.key, option, !!checked)}
                                  />
                                  <Label htmlFor={`add-${String(field.key)}-${option}`} className="text-xs cursor-pointer text-slate-700">{option}</Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <Input
                            id={`add-${String(field.key)}`}
                            type={field.type || 'text'}
                            name={String(field.key)}
                            placeholder={`Ingrese ${field.placeholder.toLowerCase()}...`}
                            value={(newItem[field.key] as string | number) || ''}
                            onChange={handleAddChange}
                            className="bg-white border-slate-200 focus-visible:ring-primary/20"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
              
              <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 flex gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isAdding}>
                  Cancelar
                </Button>
                <Button onClick={handleAddItem} disabled={isAdding} className="bg-primary hover:bg-primary/90 min-w-[120px]">
                  {isAdding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Guardar Registro
                </Button>
              </DialogFooter>
            </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          {/* Formulario de Agregar OLD - REMOVED */}

          {/* Tabla de Datos */}
          <div className="rounded-xl border border-slate-100 bg-white overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-slate-50/50">
                  {columns.map(col => <TableHead key={String(col.key)} className="font-semibold text-slate-700">{col.header}</TableHead>)}
                  <TableHead className="text-right w-[120px] font-semibold text-slate-700">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={columns.length + 1} className="h-32 text-center text-slate-500">
                            {searchTerm ? `No se encontraron resultados para "${searchTerm}"` : 'No hay registros todavía.'}
                        </TableCell>
                    </TableRow>
                ) : (
                    paginatedItems.map((item) => {
                        const isEditing = editingId === item.id;

                        return (
                        <TableRow key={item.id} className="group hover:bg-slate-50/80 transition-colors">
                            {columns.map(col => (
                                <TableCell key={String(col.key)} className="py-3">
                                    {isEditing && formFields.some(f => f.key === col.key) ? (
                                        (() => {
                                          const field = formFields.find(f => f.key === col.key);
                                          if (field?.type === 'checkbox-group') {
                                            return (
                                              <div className="flex flex-wrap gap-2 max-w-[300px]">
                                                {field.options?.map(option => (
                                                  <div key={option} className="flex items-center space-x-1">
                                                    <Checkbox 
                                                      id={`edit-${item.id}-${option}`} 
                                                      checked={((editData[col.key] as string[]) || []).includes(option)}
                                                      onCheckedChange={(checked) => handleEditCheckboxChange(col.key, option, !!checked)}
                                                    />
                                                    <Label htmlFor={`edit-${item.id}-${option}`} className="text-[10px] cursor-pointer">{option}</Label>
                                                  </div>
                                                ))}
                                              </div>
                                            );
                                          }
                                          return (
                                            <Input
                                                type={field?.type || 'text'}
                                                name={String(col.key)}
                                                value={(editData[col.key] as string | number) || ''}
                                                onChange={handleEditChange}
                                                className="h-8 text-sm"
                                            />
                                          );
                                        })()
                                    ) : (
                                        (() => {
                                          const val = item[col.key];
                                          if (Array.isArray(val)) {
                                            return (
                                              <div className="flex flex-wrap gap-1">
                                                {val.map((v: string) => (
                                                  <Badge key={v} variant="secondary" className="text-[9px] font-bold px-1.5 py-0 bg-slate-100 text-slate-600 border-slate-200">
                                                    {v}
                                                  </Badge>
                                                ))}
                                              </div>
                                            );
                                          }
                                          return <span className="text-slate-700 font-medium">{String(val || '—')}</span>;
                                        })()
                                    )}
                                </TableCell>
                            ))}
                            <TableCell className="text-right py-3">
                                {isEditing ? (
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => handleSaveEdit(item.id)} disabled={isSaving} className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={cancelEditing} disabled={isSaving} className="h-8 w-8 text-slate-400 hover:text-slate-600">
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex justify-end gap-1 transition-opacity">
                                        <Button variant="ghost" size="icon" onClick={() => startEditing(item)} className="h-8 w-8 text-primary hover:text-primary/80 hover:bg-primary/5">
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => removeAdminItem(itemType, item.id)} className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                        );
                    })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border border-slate-100 bg-white px-4 py-3 sm:px-6 rounded-xl shadow-sm mt-4">
                <div className="flex flex-1 justify-between sm:hidden">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Anterior
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Siguiente
                    </Button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-slate-700">
                            Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredItems.length)}</span> de <span className="font-medium">{filteredItems.length}</span> resultados
                        </p>
                    </div>
                    <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <Button
                                variant="outline"
                                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
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
                                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
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
        </div>
      </CardContent>
    </div>
  );
}
