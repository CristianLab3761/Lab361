'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ShoppingCart, LogIn, ArrowRight, UserPlus, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    cargo: '',
    role: 'solicitante', // default is 'Requisidor'
  });



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (role: string) => {
    setFormData(prev => ({ ...prev, role }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            display_name: formData.name,
            department: formData.department,
            role: formData.role,
          }
        }
      });

      if (authError) throw authError;
      if (!authData?.user) {
        throw new Error('No se pudo completar el registro: No se obtuvo información del usuario.');
      }

      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([{
          id: authData.user.id,
          email: formData.email,
          displayName: formData.name,
          department: formData.department,
          cargo: formData.cargo,
          role: formData.role,
          createdAt: new Date().toISOString(),
        }]);

      if (profileError) {
        throw profileError;
      }

      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada correctamente.",
      });

      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al registrarse",
        description: error.message || "No se pudo procesar la solicitud.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full font-body bg-black text-white">
      {/* Left Side - Visual/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col relative w-1/2 p-20 text-white overflow-hidden bg-black border-r border-white/5 shadow-[20px_0_60px_rgba(0,0,0,0.8)] shrink-0">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,#2563eb_0%,transparent_70%)] opacity-30" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,#22c55e_0%,transparent_70%)] opacity-20" />
          <div className="absolute top-0 left-0 right-0 h-full w-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-screen" />
          
          <div className="absolute top-1/2 left-1/2 h-[700px] w-[700px] bg-primary/10 rounded-full mix-blend-overlay filter blur-[180px] animate-pulse -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="relative z-10 flex items-center gap-4 mb-auto">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-black shadow-neon-orange transition-all hover:scale-110 active:scale-95">
            <ShoppingCart className="h-8 w-8" />
          </div>
          <span className="text-4xl font-black tracking-tighter uppercase italic drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Botanical</span>
        </div>

        <div className="relative z-10 mt-auto">
          <h1 className="text-8xl font-black tracking-tighter mb-10 leading-[0.8] lg:max-w-2xl drop-shadow-[0_10px_30px_rgba(0,0,0,1)]">
            Acceso <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-accent drop-shadow-none">
               Total.
            </span>
          </h1>
          <p className="text-xl text-white/60 max-w-lg mb-14 leading-relaxed font-black italic uppercase tracking-wider">
            Únete a la vanguardia de la gestión técnica con contraste absoluto.
          </p>
          
          <div className="flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.3em] opacity-40">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-accent shadow-neon-green" />
              <span>Full Spectrum</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-accent shadow-neon-green" />
              <span>Vibrant Core</span>
            </div>
          </div>
        </div>
      </div>

    <div className="flex min-h-screen w-full flex-col lg:flex-row font-body bg-background selection:bg-primary/20">
      {/* Left Side - Visual/Branding */}
      <div className="relative hidden w-1/2 flex-col bg-slate-50 p-16 lg:flex overflow-hidden border-r border-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#2563eb_0%,transparent_50%)] opacity-[0.05]" />
        
        <div className="relative z-20 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-brand transition-transform hover:scale-105">
            <ShoppingCart className="h-8 w-8" />
          </div>
          <span className="text-3xl font-black tracking-tighter uppercase italic text-slate-900">Botanical</span>
        </div>

        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-6">
            <p className="text-5xl font-black tracking-tighter leading-none text-slate-900 uppercase italic">
              Únete a la <br />
              <span className="text-primary italic">Red de Eficiencia</span> <br />
              Corporativa
            </p>
            <footer className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 border-l-4 border-primary pl-6">
              Protocolo de Alta de Usuario v2.4
            </footer>
          </blockquote>
        </div>

        {/* Brand visual aid */}
        <div className="absolute bottom-[-10%] right-[-10%] h-[400px] w-[400px] rounded-full border-[30px] border-primary/5 blur-sm" />
      </div>

      {/* Right Side - Register Form */}
      <div className="flex flex-col w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 justify-center bg-white relative overflow-hidden">
        <div className="w-full max-w-xl mx-auto space-y-12 relative z-10 py-10">
          <div className="text-center lg:text-left space-y-3">
            <div className="flex lg:hidden items-center justify-center gap-4 mb-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-brand">
                <ShoppingCart className="h-7 w-7" />
              </div>
              <span className="text-3xl font-bold tracking-tight uppercase text-slate-900">Botanical</span>
            </div>
            <div className="flex items-center gap-4 lg:justify-start justify-center">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <UserPlus className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-4xl font-bold tracking-tight text-slate-900 uppercase">Nuevo <span className="text-primary">Perfil</span></h2>
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              Protocolo de Registro: Inicializando Credenciales
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-8">
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Alias Operativo</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="NOMBRE APELLIDO"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="h-14 bg-slate-50 border-slate-100 text-slate-900 focus-visible:ring-primary focus-visible:bg-white rounded-2xl font-semibold px-6 transition-all shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cargo" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Función Táctica</Label>
                <Input
                  id="cargo"
                  name="cargo"
                  placeholder="CARGO"
                  value={formData.cargo}
                  onChange={handleChange}
                  required
                  className="h-14 bg-slate-50 border-slate-100 text-slate-900 focus-visible:ring-primary focus-visible:bg-white rounded-2xl font-semibold px-6 transition-all shadow-sm"
                />
              </div>
            </div>



            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label htmlFor="department" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">División Técnica</Label>
                <Input
                  id="department"
                  name="department"
                  placeholder="DEPARTAMENTO"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="h-14 bg-slate-50 border-slate-100 text-slate-900 focus-visible:ring-primary rounded-2xl px-6 font-semibold transition-all shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Nivel de Acceso</Label>
                <Select value={formData.role} onValueChange={handleRoleChange} required>
                  <SelectTrigger id="role" className="h-14 bg-slate-50 border-slate-100 text-slate-900 focus-visible:ring-primary rounded-2xl px-6 font-semibold">
                    <SelectValue placeholder="ROL" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-200 bg-white">
                    <SelectItem value="solicitante" className="rounded-xl font-semibold uppercase hover:bg-slate-50">Solicitante</SelectItem>
                    <SelectItem value="compras" className="rounded-xl font-semibold uppercase hover:bg-slate-50">Comprador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-8 pt-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Email Corporativo</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="usuario@botanical.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-16 bg-slate-50 border-slate-100 text-slate-900 focus-visible:ring-primary focus-visible:bg-white rounded-2xl px-6 font-semibold transition-all shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="h-16 bg-slate-50 border-slate-100 text-slate-900 focus-visible:ring-primary focus-visible:bg-white rounded-2xl px-6 font-semibold transition-all shadow-sm"
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
                  SINCRONIZAR ACCESO
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
                ¿Protocolo Iniciado?
              </span>
            </div>
          </div>

          <div className="text-center pb-12">
            <Link href="/login" className="inline-flex items-center justify-center rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border-2 border-slate-100 bg-white shadow-sm hover:bg-slate-50 h-16 px-10 w-full text-slate-900">
              VOLVER A TERMINAL DE INGRESO
            </Link>
          </div>
        </div>

        {/* Decorative branding */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent/40 to-primary" />
      </div>
    </div>
    </div>
  );
}
