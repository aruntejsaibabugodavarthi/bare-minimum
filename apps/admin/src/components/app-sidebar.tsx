'use client';

import * as React from 'react';
import {
  LayoutDashboard,
  PackageSearch,
  ShoppingCart,
  Users,
  Settings,
  Truck,
  CreditCard,
  MessageSquare,
  BarChart
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from '@/components/ui/sidebar';

// This is sample data.
const data = {
  navMain: [
    {
      title: 'Overview',
      url: '/',
      icon: LayoutDashboard
    },
    {
      title: 'Products',
      url: '/products',
      icon: PackageSearch
    },
    {
      title: 'Orders',
      url: '/orders',
      icon: ShoppingCart
    },
    {
      title: 'Logistics',
      url: '/logistics',
      icon: Truck
    },
    {
      title: 'Payments',
      url: '/payments',
      icon: CreditCard
    },
    {
      title: 'Customers',
      url: '/customers',
      icon: Users
    },
    {
      title: 'Reviews',
      url: '/reviews',
      icon: MessageSquare
    },
    {
      title: 'Reports',
      url: '/reports',
      icon: BarChart
    },
    {
      title: 'Settings',
      url: '/settings',
      icon: Settings
    }
  ]
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="h-16 flex items-center border-b px-4">
        <span className="font-bold text-lg tracking-tight">Bare Minimum Admin</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton>
                    <a href={item.url} className="flex items-center gap-2">
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
