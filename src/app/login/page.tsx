'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ShoppingCart, LogIn, ArrowRight, Loader2, Mail, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error de autenticación",
          description: error.message || "Credenciales incorrectas o el usuario no existe.",
        });
        return;
      }

      toast({
        title: "Sesión iniciada",
        description: "Bienvenido de vuelta a Botanical.",
      });
      router.refresh();
      router.replace('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error de sistema",
        description: "Ocurrió un error inesperado al intentar iniciar sesión.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full font-body bg-white text-slate-900">
      {/* Left Side - Visual/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col relative w-1/2 overflow-hidden bg-white border-r border-slate-100 shadow-[20px_0_60px_rgba(0,0,0,0.05)]">
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/wallpaper-bsi-1.jpg" 
            alt="Botanical Background" 
            className="h-full w-full object-cover grayscale opacity-40"
          />
          {/* Corner Gradients */}
          <div className="absolute top-0 left-0 h-64 w-64 bg-gradient-to-br from-white via-white/20 to-transparent" />
          <div className="absolute top-0 right-0 h-64 w-64 bg-gradient-to-bl from-white via-white/20 to-transparent" />
          <div className="absolute bottom-0 left-0 h-64 w-64 bg-gradient-to-tr from-white via-white/20 to-transparent" />
          <div className="absolute bottom-0 right-0 h-64 w-64 bg-gradient-to-tl from-white via-white/20 to-transparent" />
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex flex-col w-full lg:w-1/2 p-8 sm:p-12 lg:p-20 justify-center bg-white relative overflow-hidden">
        <div className="w-full max-w-md mx-auto space-y-12 relative z-10 transition-all">
          <div className="text-center lg:text-left space-y-3">
            <div className="flex lg:hidden items-center justify-center gap-4 mb-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg">
                <ShoppingCart className="h-7 w-7" />
              </div>
              <span className="text-3xl font-bold tracking-tight uppercase text-slate-900">Botanical</span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900">Acceso <span className="text-primary">Premium</span></h2>
            <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              Ingrese sus credenciales de seguridad
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">E-mail Corporativo</Label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="usuario@botanical.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-16 bg-slate-50 border-slate-100 text-slate-900 focus-visible:ring-primary focus-visible:bg-white rounded-2xl pl-14 font-semibold transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Contraseña</Label>
                <Link href="#" className="text-[10px] font-bold text-primary hover:underline transition-all">¿Olvidó su clave?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-16 bg-slate-50 border-slate-100 text-slate-900 focus-visible:ring-primary focus-visible:bg-white rounded-2xl pl-14 font-semibold transition-all shadow-sm"
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-16 text-xs font-bold uppercase tracking-widest shadow-brand hover:shadow-premium-hover transition-all hover:-translate-y-1 rounded-2xl mt-6 bg-primary text-white border-none" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  PROCESANDO...
                </span>
              ) : (
                <span className="flex items-center gap-4">
                  AUTENTICAR ACCESO
                  <ArrowRight className="h-6 w-6" />
                </span>
              )}
            </Button>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-[11px] font-bold uppercase tracking-wider text-slate-300">
              <span className="bg-white px-6">
                ¿Nueva Terminal?
              </span>
            </div>
          </div>

          <div className="text-center pb-10">
            <Link href="/register" className="inline-flex items-center justify-center rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border-2 border-slate-100 bg-white shadow-sm hover:bg-slate-50 h-16 px-10 w-full text-slate-900">
              SINCRONIZAR NUEVO PERFIL
            </Link>
          </div>
        </div>

        {/* Brand visual aid for light mode */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent/40 to-primary" />
      </div>
    </div>
  );
}
