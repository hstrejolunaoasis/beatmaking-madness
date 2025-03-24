"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Music, Upload, ImageIcon, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { createBeat, updateBeat, Beat, getLicenses, getBeatLicenses, updateBeatLicenses } from "@/lib/api-client";
import { uploadBeatFile, getBeatFileUrl, createBeatWaveform } from "@/lib/supabase";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const beatFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  producer: z.string().min(2, "Producer name must be at least 2 characters"),
  price: z.coerce.number().min(1, "Price must be at least $1"),
  bpm: z.coerce.number().min(40).max(300, "BPM must be between 40 and 300"),
  key: z.string().min(1, "Key is required"),
  genre: z.string().min(1, "Genre is required"),
  mood: z.string().min(1, "Mood is required"),
  description: z.string().optional(),
  tags: z.string().transform((val) => val.split(",").map((tag) => tag.trim())),
  licenseIds: z.array(z.string()).optional(),
});

type BeatFormValues = z.infer<typeof beatFormSchema>;

interface BeatFormProps {
  initialData?: Beat | null;
  onSuccess?: () => void;
  onLoadingChange?: (loading: boolean) => void;
}

export const BeatForm: React.FC<BeatFormProps> = ({
  initialData,
  onSuccess,
  onLoadingChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("details");
  const router = useRouter();

  const title = initialData ? "Edit Beat" : "Create Beat";
  const description = initialData ? "Edit your beat" : "Add a new beat";
  const action = initialData ? "Save changes" : "Create";

  useEffect(() => {
    const fetchLicenses = async () => {
      try {
        const licensesData = await getLicenses();
        setLicenses(licensesData);
      } catch (error) {
        console.error("Failed to fetch licenses:", error);
        toast({
          title: "Error",
          description: "Failed to load licenses. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchLicenses();
  }, []);

  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(loading);
    }
  }, [loading, onLoadingChange]);

  const form = useForm<BeatFormValues>({
    resolver: zodResolver(beatFormSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          tags: initialData.tags?.join(", ") || "",
          licenseIds: [], // We'll populate this below
        }
      : {
          title: "",
          producer: "",
          price: 29.99,
          bpm: 120,
          key: "",
          genre: "",
          mood: "",
          description: "",
          tags: "",
          licenseIds: [],
        },
  });

  // Populate licenseIds if editing
  useEffect(() => {
    if (initialData?.id && licenses.length > 0) {
      const fetchBeatLicenses = async () => {
        try {
          const beatLicenses = await getBeatLicenses(initialData.id);
          const licenseIds = beatLicenses.map(license => license.id);
          form.setValue("licenseIds", licenseIds);
        } catch (error) {
          console.error("Failed to fetch beat licenses:", error);
          toast({
            title: "Error",
            description: "Failed to load beat licenses. Please try again.",
            variant: "destructive",
          });
        }
      };

      fetchBeatLicenses();
    }
  }, [initialData, licenses, form]);

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // Add a function to convert storage URLs to secure API URLs
  const getSecureMediaUrl = (path: string) => {
    if (!path) return '';
    
    // If it's already using our secure API endpoint, return as is
    if (path.startsWith('/api/media/')) {
      // If URL already has a timestamp or retry param, return it unchanged
      if (path.includes('t=') || path.includes('retry=')) {
        return path;
      }
      // Otherwise add a cache-busting timestamp
      return `${path}${path.includes('?') ? '&' : '?'}t=${Date.now()}`;
    }
    
    // For Supabase storage URLs with /storage/v1/object/ pattern
    const storageMatch = path.match(/\/storage\/v1\/object\/[^/]+\/([^?]+)/);
    if (storageMatch && storageMatch[1]) {
      return `/api/media/${storageMatch[1]}?t=${Date.now()}`;
    }
    
    // For Supabase URLs with 'private/' pattern (common after our backend fixes)
    if (path.includes('private/')) {
      // Extract the part after 'private/'
      const privatePath = path.match(/private\/([^?]+)/);
      if (privatePath && privatePath[1]) {
        return `/api/media/${privatePath[1]}?t=${Date.now()}`;
      }
    }
    
    // For full Supabase URLs like https://[project].supabase.co/storage/v1/...
    if (path.includes('supabase.co')) {
      // Try to extract the relevant part after "beats/"
      const supabasePath = path.match(/beats\/([^?]+)/);
      if (supabasePath && supabasePath[1]) {
        return `/api/media/${supabasePath[1]}?t=${Date.now()}`;
      }
    }
    
    // If it's a relative path without the Supabase URL structure, use it directly
    if (!path.includes('://')) {
      // Make sure we don't double up on 'private/'
      const cleanPath = path.startsWith('private/') ? path.substring(8) : path;
      return `/api/media/${cleanPath}?t=${Date.now()}`;
    }
    
    // As a fallback, return the original URL with a timestamp
    return `${path}${path.includes('?') ? '&' : '?'}t=${Date.now()}`;
  };

  // Helper function to extract filename from a path
  const getFileNameFromPath = (path: string) => {
    if (!path) return '';
    
    // Extract just the filename without any prefixes
    const parts = path.split('/');
    return parts[parts.length - 1];
  };

  // Add debug functions for media issues
  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    console.error("Audio failed to load:", e.currentTarget.src);
    // Add timestamp to URL to bust cache and retry loading
    if (e.currentTarget.src && !e.currentTarget.src.includes('retry=true')) {
      const retryUrl = new URL(e.currentTarget.src);
      retryUrl.searchParams.set('retry', 'true');
      retryUrl.searchParams.set('t', Date.now().toString());
      console.log("Retrying with URL:", retryUrl.toString());
      e.currentTarget.src = retryUrl.toString();
      return;
    }
    
    toast({
      title: "Audio load error",
      description: "Unable to load audio file. Please try refreshing the page or contact support.",
      variant: "destructive",
    });
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error("Image failed to load:", e.currentTarget.src);
    // Add timestamp to URL to bust cache and retry loading
    if (e.currentTarget.src && !e.currentTarget.src.includes('retry=true')) {
      const retryUrl = new URL(e.currentTarget.src);
      retryUrl.searchParams.set('retry', 'true');
      retryUrl.searchParams.set('t', Date.now().toString());
      console.log("Retrying with URL:", retryUrl.toString());
      e.currentTarget.src = retryUrl.toString();
      return;
    }
    
    toast({
      title: "Image load error",
      description: "Unable to load image file. Please try refreshing the page or contact support.",
      variant: "destructive",
    });
  };

  const onSubmit = async (data: BeatFormValues) => {
    try {
      setLoading(true);

      // Validate required files for new beats
      if (!initialData && !audioFile) {
        toast({
          title: "Missing audio file",
          description: "Please upload an audio file for your beat",
          variant: "destructive",
        });
        setActiveTab("audio");
        setLoading(false);
        return;
      }

      if (!initialData && !imageFile) {
        toast({
          title: "Missing image file",
          description: "Please upload an image for your beat",
          variant: "destructive",
        });
        setActiveTab("audio");
        setLoading(false);
        return;
      }

      let audioUrl = initialData?.audioUrl || "";
      let waveformUrl = initialData?.waveformUrl || "";
      let imageUrl = initialData?.imageUrl || "";

      // Handle audio upload if a new file is selected
      if (audioFile) {
        try {
          console.log("Uploading audio file...");
          const filePath = await uploadBeatFile(audioFile);
          console.log("Audio file uploaded successfully, getting URL...");
          audioUrl = await getBeatFileUrl(filePath);
          console.log("Creating waveform...");
          waveformUrl = await createBeatWaveform(filePath);
        } catch (uploadError) {
          console.error("Audio upload error:", uploadError);
          toast({
            title: "Audio upload failed",
            description: uploadError instanceof Error ? uploadError.message : "Failed to upload audio file. Please try again.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      // Handle image upload if a new file is selected
      if (imageFile) {
        try {
          console.log("Uploading image file...");
          const filePath = await uploadBeatFile(imageFile, "beat-images");
          console.log("Image file uploaded successfully, getting URL...");
          imageUrl = await getBeatFileUrl(filePath);
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          toast({
            title: "Image upload failed",
            description: uploadError instanceof Error ? uploadError.message : "Failed to upload image file. Please try again.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      const beatData = {
        ...data,
        audioUrl,
        imageUrl,
        waveformUrl,
      };

      let beatId = "";

      try {
        if (initialData) {
          console.log("Updating existing beat...");
          const updatedBeat = await updateBeat(initialData.id, beatData);
          beatId = updatedBeat.id;
        } else {
          console.log("Creating new beat...");
          const newBeat = await createBeat(beatData);
          beatId = newBeat.id;
        }
      } catch (beatError) {
        console.error("Beat save error:", beatError);
        toast({
          title: "Beat save failed",
          description: beatError instanceof Error 
            ? beatError.message 
            : `Failed to ${initialData ? "update" : "create"} beat. Please check all required fields.`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Handle license associations
      if (data.licenseIds && data.licenseIds.length > 0) {
        try {
          console.log("Updating beat licenses...");
          await updateBeatLicenses(beatId, data.licenseIds);
        } catch (licenseError) {
          console.error("License association error:", licenseError);
          // We'll continue even if this fails, as the beat is already saved
          toast({
            title: "Warning",
            description: "Beat saved, but there was an issue with license assignments.",
            variant: "default",
          });
        }
      }

      router.refresh();
      toast({
        title: "Success",
        description: `Beat ${initialData ? "updated" : "created"} successfully`,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting beat:", error);
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : `Failed to ${initialData ? "update" : "create"} beat. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Beat Details</TabsTrigger>
          <TabsTrigger value="audio">Audio & Image</TabsTrigger>
          <TabsTrigger value="licenses">Licenses</TabsTrigger>
        </TabsList>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Describe your beat..."
                          className="resize-none min-h-[100px]"
                        />
                      </FormControl>
                      <FormDescription>
                        Provide details about the beat, its style, and any other relevant information
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormDescription>
                        Starting price for the basic license
                      </FormDescription>
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
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a key" />
                          </SelectTrigger>
                          <SelectContent>
                            {["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].map((key) => (
                              <SelectItem key={key} value={key}>
                                {key}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="genre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Genre</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a genre" />
                          </SelectTrigger>
                          <SelectContent>
                            {["Hip Hop", "R&B", "Pop", "Trap", "Drill", "Electronic", "Jazz", "Rock", "Dancehall", "Afrobeat"].map((genre) => (
                              <SelectItem key={genre} value={genre}>
                                {genre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a mood" />
                          </SelectTrigger>
                          <SelectContent>
                            {["Energetic", "Chill", "Dark", "Happy", "Sad", "Aggressive", "Motivational", "Atmospheric"].map((mood) => (
                              <SelectItem key={mood} value={mood}>
                                {mood}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Comma-separated tags (e.g. "dark, emotional, 808s")
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>
            <TabsContent value="audio" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Heading size="sm" title="Beat Audio" />
                  <Separator />
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="audio">Upload Beat (MP3/WAV)</Label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center space-y-2">
                      <Music size={36} className="text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Drag and drop or click to upload
                      </p>
                      <Input
                        id="audio"
                        type="file"
                        accept=".mp3,.wav"
                        onChange={handleAudioChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("audio")?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Select Audio File
                      </Button>
                      {audioFile && (
                        <p className="text-sm">{audioFile.name}</p>
                      )}
                      {initialData?.audioUrl && !audioFile && (
                        <div className="text-sm">
                          <p>Current audio: {getFileNameFromPath(initialData.audioUrl)}</p>
                          <div className="mt-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mb-2"
                              onClick={() => {
                                const audio = document.getElementById('current-audio') as HTMLAudioElement;
                                if (audio) {
                                  if (audio.paused) {
                                    audio.play().catch(err => {
                                      console.error("Error playing audio:", err);
                                      toast({
                                        title: "Playback error",
                                        description: "Could not play the audio file. Please try again.",
                                        variant: "destructive",
                                      });
                                    });
                                  } else {
                                    audio.pause();
                                  }
                                }
                              }}
                            >
                              <Play className="mr-2 h-4 w-4" />
                              Play/Pause
                            </Button>
                            <audio 
                              id="current-audio"
                              controls 
                              className="max-w-full" 
                              src={getSecureMediaUrl(initialData.audioUrl)}
                              onError={handleAudioError}
                              preload="none"
                            >
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <Heading size="sm" title="Beat Artwork" />
                  <Separator />
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="image">Upload Artwork (JPG/PNG)</Label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center space-y-2">
                      <ImageIcon size={36} className="text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Drag and drop or click to upload
                      </p>
                      <Input
                        id="image"
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("image")?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Select Image File
                      </Button>
                      {imageFile && (
                        <p className="text-sm">{imageFile.name}</p>
                      )}
                      {initialData?.imageUrl && !imageFile && (
                        <div className="text-sm">
                          <p>Current image: {getFileNameFromPath(initialData.imageUrl)}</p>
                          <img 
                            src={getSecureMediaUrl(initialData.imageUrl)} 
                            alt="Beat artwork" 
                            className="mt-2 max-w-[100px] max-h-[100px] rounded-md"
                            onError={handleImageError}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="licenses" className="space-y-4">
              <Heading size="sm" title="License Options" />
              <Separator />
              {licenses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {licenses.map((license) => (
                    <Card key={license.id}>
                      <CardHeader>
                        <CardTitle>{license.name}</CardTitle>
                        <CardDescription>
                          {license.licenseType?.name || "Standard License"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">${license.price}</p>
                        <ul className="mt-2 space-y-1 text-sm">
                          {license.features?.map((feature: string, index: number) => (
                            <li key={index} className="flex items-center">
                              <span className="mr-2">•</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <FormField
                          control={form.control}
                          name="licenseIds"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(license.id)}
                                  onCheckedChange={(checked) => {
                                    const currentValues = field.value || [];
                                    if (checked) {
                                      field.onChange([...currentValues, license.id]);
                                    } else {
                                      field.onChange(
                                        currentValues.filter((id) => id !== license.id)
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                              <div className="leading-none">
                                <FormLabel>Offer this license</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No licenses found. Please create licenses first.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => router.push("/dashboard/licenses")}
                  >
                    Go to Licenses
                  </Button>
                </div>
              )}
            </TabsContent>
            <div className="flex justify-end mt-6 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  action
                )}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}; 