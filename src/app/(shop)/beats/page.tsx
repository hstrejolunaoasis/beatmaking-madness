"use client";

import { useApi } from "@/lib/hooks/useApi";
import { Beat } from "@/types";
import { BeatCard } from "@/components/common/BeatCard";
import { Skeleton } from "@/components/ui/skeleton";

function BeatSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg">
      <Skeleton className="w-full h-48" />
      <div className="p-4 space-y-2">
        <Skeleton className="w-3/4 h-5" />
        <Skeleton className="w-1/2 h-4" />
        <div className="flex gap-1 pt-2">
          <Skeleton className="w-16 h-6" />
          <Skeleton className="w-16 h-6" />
        </div>
        <div className="flex justify-between pt-2">
          <Skeleton className="w-16 h-6" />
          <Skeleton className="w-24 h-9" />
        </div>
      </div>
    </div>
  );
}

export default function BeatsPage() {
  const { data: beats, loading, error } = useApi<Beat[]>({
    url: "/api/beats",
  });

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">Browse Beats</h1>
      
      {error && (
        <div className="p-4 text-white bg-red-500 rounded-md">
          An error occurred: {error.message}
        </div>
      )}
      
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <BeatSkeleton key={i} />)
          : beats?.map((beat) => <BeatCard key={beat.id} beat={beat} />)}
      </div>
      
      {beats?.length === 0 && !loading && (
        <div className="py-12 text-center">
          <h3 className="text-xl">No beats available yet</h3>
          <p className="text-muted-foreground">Check back soon for new beats</p>
        </div>
      )}
    </div>
  );
} 