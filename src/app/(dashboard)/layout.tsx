import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Music, Upload, DollarSign, Menu, X } from "lucide-react";

import { getCurrentUser } from "@/lib/supabase/server-actions";
import { UserNav } from "@/components/auth/user-nav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Create a reusable navigation component
function MainNav() {
  const links = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4 mr-2" /> },
    { href: "/dashboard/beats", label: "My Beats", icon: <Music className="h-4 w-4 mr-2" /> },
    { href: "/dashboard/upload", label: "Upload", icon: <Upload className="h-4 w-4 mr-2" /> },
    { href: "/dashboard/sales", label: "Sales", icon: <DollarSign className="h-4 w-4 mr-2" /> },
  ];

  return (
    <nav className="hidden md:flex items-center gap-6">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="flex items-center text-sm font-medium transition-colors hover:text-primary"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

// Create a mobile navigation component
function MobileNav({ user }: { user: any }) {
  const links = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4 mr-2" /> },
    { href: "/dashboard/beats", label: "My Beats", icon: <Music className="h-4 w-4 mr-2" /> },
    { href: "/dashboard/upload", label: "Upload", icon: <Upload className="h-4 w-4 mr-2" /> },
    { href: "/dashboard/sales", label: "Sales", icon: <DollarSign className="h-4 w-4 mr-2" /> },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] sm:w-[300px]">
        <div className="flex flex-col h-full">
          <div className="py-4 border-b">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              BeatMaking Madness
            </Link>
            {user?.user_metadata?.name && (
              <p className="text-sm text-muted-foreground mt-2">
                Hello, {user.user_metadata.name}
              </p>
            )}
          </div>
          <nav className="flex flex-col gap-2 py-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center py-2 px-3 text-sm font-medium rounded-md hover:bg-accent transition-colors"
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto py-4 border-t">
            <Link href="/dashboard/profile" className="flex items-center py-2 px-3 text-sm font-medium rounded-md hover:bg-accent transition-colors">
              Profile Settings
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <MobileNav user={user} />
            <Link href="/" className="hidden md:flex font-bold text-xl">
              BeatMaking Madness
            </Link>
            <MainNav />
          </div>
          <UserNav user={user} />
        </div>
      </header>
      <main className="flex-1 pb-12">
        {children}
      </main>
      <footer className="py-6 border-t">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} BeatMaking Madness. All rights reserved.</p>
          <nav className="flex items-center gap-4">
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/support" className="hover:underline">Support</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
} 