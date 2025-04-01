import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server-actions";

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
    <div className="flex min-h-screen flex-col items-center justify-center">
      {children}
    </div>
  );
} 