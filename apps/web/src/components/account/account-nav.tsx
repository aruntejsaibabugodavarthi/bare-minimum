'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { User, Package, Heart, MapPin, Wallet, Star, Bell, HelpCircle } from 'lucide-react';

const items = [
  {
    title: 'Overview',
    href: '/account',
    icon: User
  },
  {
    title: 'My Orders',
    href: '/account/orders',
    icon: Package
  },
  {
    title: 'My Wishlist',
    href: '/account/wishlist',
    icon: Heart
  },
  {
    title: 'Addresses',
    href: '/account/addresses',
    icon: MapPin
  },
  {
    title: 'Payments & Wallet',
    href: '/account/wallet',
    icon: Wallet
  },
  {
    title: 'Profile Settings',
    href: '/account/profile',
    icon: User // reuse icon or maybe a settings gear
  },
  {
    title: 'My Reviews',
    href: '/account/reviews',
    icon: Star
  },
  {
    title: 'Notifications',
    href: '/account/notifications',
    icon: Bell
  },
  {
    title: 'Support',
    href: '/account/support',
    icon: HelpCircle
  }
];

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {}

export function AccountNav({ className, ...props }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0',
        className
      )}
      {...props}
    >
      {items.map((item) => {
        // exact match for /account, partial match for others
        const isActive =
          pathname === item.href || (item.href !== '/account' && pathname?.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap',
              isActive
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              'justify-start'
            )}
          >
            <item.icon
              className={cn(
                'h-4 w-4',
                isActive ? 'text-primary-foreground' : 'text-muted-foreground'
              )}
            />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
