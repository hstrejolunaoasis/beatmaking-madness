import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/supabase/server-actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if dev mode is enabled
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true' || process.env.DEV_MODE === 'true';
  
  // For dev mode, we'll rely on the middleware for session checks
  if (!devMode) {
    const user = await getCurrentUser();
    
    if (!user) {
      redirect("/sign-in");
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      {children}
    </div>
  );
} 