import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppProvider } from '@/context/app-context';
import { FirebaseClientProvider } from '@/firebase/client-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'OrdenaPro',
  description: 'Sistema de automatización de Órdenes de Compra',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
