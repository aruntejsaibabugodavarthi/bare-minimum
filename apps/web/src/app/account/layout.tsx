import { Metadata } from 'next';
import { AccountNav } from '@/components/account/account-nav';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'My Account',
  description: 'Manage your account settings and preferences.'
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Account</h2>
          <p className="text-muted-foreground">Manage your orders, profile, and preferences.</p>
        </div>
        <Separator className="my-6" />
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="-mx-4 lg:w-1/4">
            <AccountNav />
          </aside>
          <div className="flex-1 lg:max-w-4xl">{children}</div>
        </div>
      </div>
    </div>
  );
}
