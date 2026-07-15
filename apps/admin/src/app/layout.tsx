import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

const outfit = Outfit({
  variable: '--font-heading',
  subsets: ['latin']
});

const inter = Inter({
  variable: '--font-body',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'Bare Minimum — Admin',
  description: 'Admin dashboard for Bare Minimum store management.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="flex w-full flex-col">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="mr-2 h-4 w-px bg-border" />
              <span className="text-sm text-muted-foreground">Dashboard</span>
            </header>
            <main className="flex-1 p-4 md:p-6">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
