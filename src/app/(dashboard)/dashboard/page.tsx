"use client";

import { useState } from "react";
import UploadBeatForm from "@/components/forms/UploadBeatForm";
import { Button } from "@/components/ui/button";
import { useApi } from "@/lib/hooks/useApi";
import { Beat } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function BeatDashboardSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-4 border rounded-md">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="w-40 h-6" />
              <Skeleton className="w-24 h-4" />
            </div>
            <Skeleton className="w-20 h-8" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"upload" | "manage">("manage");
  const { data: beats, loading, error, refetch } = useApi<Beat[]>({
    url: "/api/beats",
  });

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">Producer Dashboard</h1>
      
      <div className="flex space-x-4 mb-6">
        <Button
          variant={activeTab === "manage" ? "default" : "outline"}
          onClick={() => setActiveTab("manage")}
        >
          Manage Beats
        </Button>
        <Button
          variant={activeTab === "upload" ? "default" : "outline"}
          onClick={() => setActiveTab("upload")}
        >
          Upload New Beat
        </Button>
      </div>
      
      {activeTab === "upload" ? (
        <Card>
          <CardHeader>
            <CardTitle>Upload a New Beat</CardTitle>
          </CardHeader>
          <CardContent>
            <UploadBeatForm />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Your Beats</h2>
            <Button variant="outline" onClick={() => refetch()}>
              Refresh
            </Button>
          </div>
          
          {error && (
            <div className="p-4 text-white bg-red-500 rounded-md">
              Error loading beats: {error.message}
            </div>
          )}
          
          {loading ? (
            <BeatDashboardSkeleton />
          ) : (
            <div className="space-y-4">
              {beats && beats.length > 0 ? (
                beats.map((beat) => (
                  <div key={beat.id} className="p-4 border rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">{beat.title}</h3>
                        <p className="text-muted-foreground">
                          ${beat.price.toFixed(2)} • {beat.bpm} BPM • {beat.key}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/beats/${beat.id}`, "_blank")}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <h3 className="text-xl">You haven't uploaded any beats yet</h3>
                  <p className="text-muted-foreground">
                    Click "Upload New Beat" to get started
                  </p>
                  <Button 
                    className="mt-4"
                    onClick={() => setActiveTab("upload")}
                  >
                    Upload New Beat
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 