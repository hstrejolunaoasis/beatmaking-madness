import { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/supabase/server-actions";

export const metadata: Metadata = {
  title: "Dashboard | BeatMaking Madness",
  description: "Manage your beats and account",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // This is a fallback - middleware should handle this but just in case
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid gap-6">
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Welcome back{user?.user_metadata?.name ? `, ${user.user_metadata.name}` : ''}!</h2>
          <p className="text-muted-foreground">
            This is your beatmaker dashboard where you can manage your beats, see your stats, and more.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Your Beats</h3>
            <p className="text-muted-foreground mb-4">Manage and upload your beats</p>
            <p className="text-2xl font-bold">0</p>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Downloads</h3>
            <p className="text-muted-foreground mb-4">Total beat downloads</p>
            <p className="text-2xl font-bold">0</p>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Sales</h3>
            <p className="text-muted-foreground mb-4">Your total sales</p>
            <p className="text-2xl font-bold">$0</p>
          </div>
        </div>
      </div>
    </div>
  );
} 