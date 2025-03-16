import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/services/auth";
import { UserNav } from "@/components/auth/user-nav";

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
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-bold text-xl">
              BeatMaking Madness
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/beats"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                My Beats
              </Link>
              <Link
                href="/dashboard/upload"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Upload
              </Link>
              <Link
                href="/dashboard/sales"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Sales
              </Link>
            </nav>
          </div>
          <UserNav user={user} />
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
} 