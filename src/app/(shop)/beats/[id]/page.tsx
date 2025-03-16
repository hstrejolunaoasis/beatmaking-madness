"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BeatPlayer } from "@/components/common/BeatPlayer";
import { Button } from "@/components/ui/button";
import { BEAT_LICENSES } from "@/lib/config/constants";
import { useCartStore } from "@/lib/store/cart";
import { LicenseType, Beat } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function BeatDetailSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="space-y-4">
        <Skeleton className="w-3/4 h-10" />
        <Skeleton className="w-1/2 h-6" />
        <Skeleton className="w-full h-48" />
      </div>
      <div className="space-y-4">
        <Skeleton className="w-full h-8" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="w-full h-48" />
          <Skeleton className="w-full h-48" />
          <Skeleton className="w-full h-48" />
        </div>
      </div>
    </div>
  );
}

export default function BeatDetailPage() {
  const params = useParams();
  const [beat, setBeat] = useState<Beat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCartStore();

  useEffect(() => {
    async function fetchBeat() {
      try {
        setLoading(true);
        const response = await fetch(`/api/beats/${params.id}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to fetch beat");
        }

        setBeat(result.data);
      } catch (err) {
        console.error("Error fetching beat:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchBeat();
    }
  }, [params.id]);

  const handleAddToCart = (licenseType: LicenseType) => {
    if (!beat) return;

    const license = BEAT_LICENSES[licenseType];
    
    addItem({
      beatId: beat.id,
      licenseType,
      price: license.price,
    });
  };

  if (loading) {
    return (
      <div className="container py-8">
        <BeatDetailSkeleton />
      </div>
    );
  }

  if (error || !beat) {
    return (
      <div className="container py-8">
        <div className="p-4 text-white bg-red-500 rounded-md">
          {error || "Beat not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{beat.title}</h1>
            <p className="text-xl text-muted-foreground">
              Produced by {beat.producer}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex gap-4">
              <div className="px-3 py-1 text-sm rounded-full bg-muted">
                {beat.bpm} BPM
              </div>
              <div className="px-3 py-1 text-sm rounded-full bg-muted">
                {beat.key}
              </div>
              <div className="px-3 py-1 text-sm rounded-full bg-muted">
                {beat.genre}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {beat.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 text-sm rounded-full bg-muted">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <BeatPlayer audioUrl={beat.audioUrl} waveformUrl={beat.waveformUrl} />
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Choose Your License</h2>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
            {(Object.entries(BEAT_LICENSES) as [LicenseType, typeof BEAT_LICENSES.basic][]).map(
              ([type, license]) => (
                <Card key={type} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle>{license.name}</CardTitle>
                    <CardDescription className="text-2xl font-bold">
                      ${license.price.toFixed(2)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <ul className="space-y-1 text-sm">
                      {license.features.map((feature) => (
                        <li key={feature} className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4 mr-2 text-primary"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <div className="p-4 pt-0">
                    <Button
                      className="w-full"
                      onClick={() => handleAddToCart(type)}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </Card>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 