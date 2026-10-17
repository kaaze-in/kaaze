import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';

export const metadata: Metadata = {
  title: 'KAAZE — Not Made to Fit In',
  description:
    'KAAZE — Premium streetwear and lifestyle e-commerce. Curated essentials and statement pieces for elevated everyday style.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col selection:bg-primary selection:text-on-primary">
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="w-full pt-16 bg-surface flex-1 flex flex-col">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
