'use client';

import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { users } from '@/lib/data';
import type { User } from '@/lib/types';

export default function LoginPage() {
  const { setCurrentUser } = useAppContext();
  const router = useRouter();

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Bienvenido a OrdenaPro</CardTitle>
            <CardDescription className="text-center">
              Selecciona un perfil para iniciar sesión
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
      <div className="grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card
            key={user.id}
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
            onClick={() => handleLogin(user)}
          >
            <CardContent className="flex flex-col items-center gap-4 p-6">
              <Avatar className="h-20 w-20 border-2">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="text-lg font-semibold">{user.name}</p>
                <p className="text-sm capitalize text-muted-foreground">{user.role}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
