import { redirect } from 'next/navigation';

export default function AdministracionPage() {
  // Redirigir a la primera categoría por defecto
  redirect('/dashboard/administracion/proveedores');
}
