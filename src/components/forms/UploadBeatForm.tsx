"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { uploadBeatFile, getBeatFileUrl, createBeatWaveform } from "@/lib/supabase/index";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  producer: z.string().min(2, {
    message: "Producer name must be at least 2 characters.",
  }),
  price: z.coerce.number().min(1, {
    message: "Price must be at least $1.",
  }),
  bpm: z.coerce.number().min(40).max(300, {
    message: "BPM must be between 40 and 300.",
  }),
  key: z.string().min(1, {
    message: "Key is required.",
  }),
  genre: z.string().min(1, {
    message: "Genre is required.",
  }),
  mood: z.string().min(1, {
    message: "Mood is required.",
  }),
  tags: z.string().transform((val) => val.split(",").map((tag) => tag.trim())),
});

export default function UploadBeatForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      producer: "",
      price: 29.99,
      bpm: 140,
      key: "",
      genre: "",
      mood: "",
      tags: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(false);

      if (!audioFile) {
        setError("Audio file is required");
        return;
      }

      // Generate a unique ID for the beat
      const beatId = crypto.randomUUID();
      
      // Upload audio file to Supabase Storage
      const audioPath = `${beatId}/audio.mp3`;
      await uploadBeatFile(audioFile, audioPath);
      const audioUrl = await getBeatFileUrl(audioPath);
      
      // Upload image file if provided
      let imageUrl = "";
      if (imageFile) {
        const imagePath = `${beatId}/cover.jpg`;
        await uploadBeatFile(imageFile, imagePath);
        imageUrl = await getBeatFileUrl(imagePath);
      }
      
      // Generate waveform URL (in a real app this would be a more complex process)
      const waveformUrl = await createBeatWaveform(audioUrl, beatId);
      
      // Create beat in the database
      const response = await fetch("/api/beats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          id: beatId,
          imageUrl,
          audioUrl,
          waveformUrl,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to create beat");
      }
      
      // Reset form and state
      form.reset();
      setAudioFile(null);
      setImageFile(null);
      setSuccess(true);
      
    } catch (err) {
      console.error("Error uploading beat:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 text-white bg-red-500 rounded-md">{error}</div>
      )}
      
      {success && (
        <div className="p-4 text-white bg-green-500 rounded-md">
          Beat uploaded successfully!
        </div>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter beat title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="producer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Producer</FormLabel>
                  <FormControl>
                    <Input placeholder="Producer name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price ($)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="bpm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>BPM</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. C minor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="genre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Genre</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Hip Hop" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="mood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mood</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Dark, Energetic" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <Input placeholder="trap, 808, melodic" {...field} />
                </FormControl>
                <FormDescription>
                  Separate tags with commas
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FormLabel htmlFor="audio-file">Audio File</FormLabel>
              <Input
                id="audio-file"
                type="file"
                accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
              />
              <p className="mt-1 text-sm text-muted-foreground">
                Upload MP3 or WAV file (required)
              </p>
            </div>
            
            <div>
              <FormLabel htmlFor="image-file">Cover Image</FormLabel>
              <Input
                id="image-file"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
              <p className="mt-1 text-sm text-muted-foreground">
                Upload JPG, PNG (optional)
              </p>
            </div>
          </div>
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Uploading..." : "Upload Beat"}
          </Button>
        </form>
      </Form>
    </div>
  );
} 