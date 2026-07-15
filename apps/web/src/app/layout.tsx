import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { cn } from '@/lib/utils';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-heading' });
const inter = Inter({ subsets: ['latin'], variable: '--font-body' });

export const metadata: Metadata = {
  title: 'Bare Minimum — Curated Essentials',
  description:
    'Curated essentials for modern, intentional living. Premium minimalist products designed with purpose.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={cn('font-sans', outfit.variable, inter.variable)}>
      <body className="antialiased bg-[#f5f0e8] text-[#2e2e2e] min-h-screen">
        <Navbar />
        <main style={{ paddingTop: 'var(--nav-height)' }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
