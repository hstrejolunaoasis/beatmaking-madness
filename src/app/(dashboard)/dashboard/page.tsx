import { Metadata } from "next";
import { redirect } from "next/navigation";
import { BarChart, LineChart, Activity, Download, DollarSign, Music, Calendar, TrendingUp, Users } from "lucide-react";
import Link from "next/link";

import { getCurrentUser } from "@/lib/supabase/server-actions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Create reusable component for stat cards
function StatCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend = null, 
  actionLabel = null, 
  actionHref = null 
}: { 
  title: string; 
  value: string | number; 
  description: string; 
  icon: React.ReactNode;
  trend?: { value: string; isPositive: boolean } | null;
  actionLabel?: string | null;
  actionHref?: string | null;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="p-2 bg-primary/10 rounded-full">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {trend && (
          <div className={`inline-flex items-center text-xs mt-2 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
            <TrendingUp className={`h-3 w-3 mr-1 ${trend.isPositive ? '' : 'transform rotate-180'}`} />
            <span>{trend.value} {trend.isPositive ? 'increase' : 'decrease'}</span>
          </div>
        )}
      </CardContent>
      {actionLabel && actionHref && (
        <CardFooter className="p-2">
          <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
            <a href={actionHref}>{actionLabel}</a>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

// Create component for recent activity
function RecentActivity() {
  // In a real app, you would fetch this data
  const activities = [
    { date: "2023-07-15", event: "Beat uploaded", name: "Summer Vibes" },
    { date: "2023-07-12", event: "Beat sold", name: "Midnight Flow" },
    { date: "2023-07-10", event: "New follower", name: "Producer123" },
  ];

  if (activities.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, i) => (
        <div key={i} className="flex items-start space-x-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">{activity.event}: {activity.name}</p>
            <p className="text-xs text-muted-foreground">{activity.date}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

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

  // In a real application, you would fetch these metrics from your database
  const stats = {
    beatsCount: 0,
    downloads: 0,
    sales: "$0",
    followers: 0,
    monthlyListens: 0,
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <nav className="flex items-center gap-4 mt-4 sm:mt-0">
          <Link href="/dashboard" className="text-sm font-medium hover:text-primary">Dashboard</Link>
          <Link href="/dashboard/beats" className="text-sm font-medium hover:text-primary">My Beats</Link>
          <Link href="/dashboard/upload" className="text-sm font-medium hover:text-primary">Upload</Link>
          <Link href="/dashboard/sales" className="text-sm font-medium hover:text-primary">Sales</Link>
        </nav>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-muted-foreground">
            Welcome back{user?.user_metadata?.name ? `, ${user.user_metadata.name}` : ''}!
          </p>
        </div>
        <Button asChild>
          <a href="/dashboard/upload">Upload New Beat</a>
        </Button>
      </div>
      
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Your Beats" 
          value={stats.beatsCount} 
          description="Total beats uploaded" 
          icon={<Music className="h-4 w-4 text-primary" />}
          actionLabel="Manage Beats"
          actionHref="/dashboard/beats"
        />
        <StatCard 
          title="Downloads" 
          value={stats.downloads} 
          description="Total beat downloads" 
          icon={<Download className="h-4 w-4 text-primary" />}
          trend={{ value: "0%", isPositive: true }}
        />
        <StatCard 
          title="Sales" 
          value={stats.sales} 
          description="Total revenue earned" 
          icon={<DollarSign className="h-4 w-4 text-primary" />}
          trend={{ value: "0%", isPositive: true }}
          actionLabel="View Sales"
          actionHref="/dashboard/sales"
        />
        <StatCard 
          title="Followers" 
          value={stats.followers} 
          description="People following your profile" 
          icon={<Users className="h-4 w-4 text-primary" />}
        />
      </div>

      {/* Activity and Analytics Section */}
      <div className="grid gap-4 md:grid-cols-7">
        {/* Activity Feed - 3 columns on larger screens */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-xl">Recent Activity</CardTitle>
            <CardDescription>Your latest interactions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <a href="/dashboard/activity">View All Activity</a>
            </Button>
          </CardFooter>
        </Card>

        {/* Performance Overview - 4 columns on larger screens */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle className="text-xl">Performance Overview</CardTitle>
            <CardDescription>Analytics for the past 30 days</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col items-center justify-center">
            {/* In a real application, you would render a chart here */}
            <div className="text-center mb-4">
              <BarChart className="h-16 w-16 text-primary/20 mx-auto mb-4" />
              <p className="text-muted-foreground">No analytics data available yet</p>
              <p className="text-xs text-muted-foreground">Upload and sell beats to see performance metrics</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Upcoming Releases</CardTitle>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <p className="text-muted-foreground">No upcoming releases scheduled</p>
              <Button size="sm" variant="outline" className="mt-4">Schedule a Release</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Trending Genres</CardTitle>
              <LineChart className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <p className="text-muted-foreground">Upload beats to see trending genres</p>
              <Button size="sm" variant="outline" className="mt-4" asChild>
                <a href="/dashboard/upload">Upload Now</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 