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

      if (error) throw error;

      toast({
        title: "Sesión iniciada",
        description: "Bienvenido de vuelta a Botanical.",
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error de autenticación",
        description: error.message || "Credenciales incorrectas o el usuario no existe.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full font-body bg-black text-white">
      {/* Left Side - Visual/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col relative w-1/2 p-20 text-white overflow-hidden bg-black border-r border-white/5 shadow-[20px_0_60px_rgba(0,0,0,0.8)]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#ff4d00_0%,transparent_60%)] opacity-30" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,#ccff00_0%,transparent_60%)] opacity-20" />
          <div className="absolute top-0 left-0 right-0 h-full w-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-screen" />
          
          <div className="absolute top-1/3 left-1/4 h-[600px] w-[600px] bg-primary/20 rounded-full mix-blend-overlay filter blur-[180px] animate-pulse" />
          <div className="absolute -bottom-40 -right-40 h-[800px] w-[800px] bg-accent/10 rounded-full filter blur-[200px]" />
        </div>

        <div className="relative z-10 flex items-center gap-4 mb-auto">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-black shadow-lg transition-all hover:scale-110 active:scale-95">
            <ShoppingCart className="h-7 w-7" />
          </div>
          <span className="text-3xl font-bold tracking-tight uppercase text-white">Botanical</span>
        </div>

        <div className="relative z-10 mt-auto">
          <Badge variant="outline" className="mb-8 border-primary/40 text-primary font-bold uppercase tracking-wider px-6 py-2 backdrop-blur-md bg-primary/5 rounded-full text-[10px]">
             Intelligence Core • v3.0
          </Badge>
          <h1 className="text-7xl font-bold tracking-tight mb-10 leading-[0.9] lg:max-w-2xl text-white">
            Potencia <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-accent">
               Absoluta.
            </span>
          </h1>
          <p className="text-lg text-white/70 max-w-lg mb-14 leading-relaxed font-semibold tracking-wide">
            Control técnico de requisiciones con la máxima eficiencia del espectro mango.
          </p>
          
          <div className="flex items-center gap-10 text-[11px] font-bold uppercase tracking-wider">
            <div className="flex items-center gap-4 group">
              <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-lg animate-pulse" />
              <span className="text-white/60 group-hover:text-primary transition-colors">Encriptado</span>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="h-2.5 w-2.5 rounded-full bg-accent shadow-lg" />
              <span className="text-white/60 group-hover:text-accent transition-colors">Sincronizado</span>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="h-2.5 w-2.5 rounded-full bg-white shadow-lg" />
              <span className="text-white/60 group-hover:text-white transition-colors">Digital AI</span>
            </div>
          </div>
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

            <Button type="submit" className="w-full h-16 text-xs font-bold uppercase tracking-widest shadow-mango hover:shadow-premium-hover transition-all hover:-translate-y-1 rounded-2xl mt-6 bg-primary text-white border-none" disabled={loading}>
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
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-orange-400 to-primary" />
      </div>
    </div>
  );
}
