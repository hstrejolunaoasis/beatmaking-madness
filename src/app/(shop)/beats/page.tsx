"use client";

import { useApi } from "@/lib/hooks/useApi";
import { Beat } from "@/types";
import { BeatCard } from "@/components/common/BeatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { AudioPlayer } from "@/components/common/AudioPlayer";
import { 
  Card,
  CardContent
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search,
  SlidersHorizontal,
  Music2Icon, 
  XIcon,
  ArrowUpDown
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

function BeatSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg shadow-sm">
      <Skeleton className="w-full h-48" />
      <div className="p-4 space-y-2">
        <Skeleton className="w-3/4 h-5" />
        <Skeleton className="w-1/2 h-4" />
        <div className="flex gap-1 pt-2">
          <Skeleton className="w-16 h-6" />
          <Skeleton className="w-16 h-6" />
        </div>
        <div className="flex gap-2 pt-2">
          <Skeleton className="w-full h-8" />
          <Skeleton className="w-full h-8" />
          <Skeleton className="w-full h-8" />
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
  
  const [searchQuery, setSearchQuery] = useState("");
  const [currentBeat, setCurrentBeat] = useState<Beat | null>(null);
  const [filteredBeats, setFilteredBeats] = useState<Beat[]>([]);
  const [activeFilters, setActiveFilters] = useState<{
    genres: string[],
    moods: string[],
    bpmRange: [number, number],
    priceRange: [number, number],
    sortBy: string
  }>({
    genres: [],
    moods: [],
    bpmRange: [0, 300],
    priceRange: [0, 1000],
    sortBy: "newest"
  });
  
  // Extract unique genres and moods from beats
  const allGenres = beats ? [...new Set(beats.map(beat => beat.genre?.name || ''))] : [];
  const allMoods = beats ? [...new Set(beats.map(beat => beat.mood))] : [];
  
  // Find min/max BPM and prices
  const minBpm = beats ? Math.min(...beats.map(beat => beat.bpm)) : 0;
  const maxBpm = beats ? Math.max(...beats.map(beat => beat.bpm)) : 300;
  
  useEffect(() => {
    if (!beats) return;
    
    // Initialize filter ranges based on available data
    setActiveFilters(prev => ({
      ...prev,
      bpmRange: [minBpm, maxBpm],
      priceRange: [0, Math.max(...beats.map(beat => beat.price))]
    }));
    
    let filtered = [...beats];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(beat => 
        beat.title.toLowerCase().includes(query) || 
        beat.producer.toLowerCase().includes(query) ||
        beat.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply genre filter
    if (activeFilters.genres.length > 0) {
      filtered = filtered.filter(beat => 
        activeFilters.genres.includes(beat.genre?.name || '')
      );
    }
    
    // Apply mood filter
    if (activeFilters.moods.length > 0) {
      filtered = filtered.filter(beat => 
        activeFilters.moods.includes(beat.mood)
      );
    }
    
    // Apply BPM range filter
    filtered = filtered.filter(beat => 
      beat.bpm >= activeFilters.bpmRange[0] && 
      beat.bpm <= activeFilters.bpmRange[1]
    );
    
    // Apply price range filter
    filtered = filtered.filter(beat => 
      beat.price >= activeFilters.priceRange[0] && 
      beat.price <= activeFilters.priceRange[1]
    );
    
    // Apply sorting
    switch (activeFilters.sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "title-asc":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        break;
    }
    
    setFilteredBeats(filtered);
  }, [beats, searchQuery, activeFilters, minBpm, maxBpm]);
  
  const handlePlayBeat = (beat: Beat) => {
    setCurrentBeat(beat);
  };
  
  const handlePauseBeat = () => {
    // The audio player will handle the pause action
  };
  
  const handleStopPlayback = () => {
    setCurrentBeat(null);
  };
  
  const toggleGenreFilter = (genre: string) => {
    setActiveFilters(prev => {
      const isActive = prev.genres.includes(genre);
      return {
        ...prev,
        genres: isActive 
          ? prev.genres.filter(g => g !== genre)
          : [...prev.genres, genre]
      };
    });
  };
  
  const toggleMoodFilter = (mood: string) => {
    setActiveFilters(prev => {
      const isActive = prev.moods.includes(mood);
      return {
        ...prev,
        moods: isActive 
          ? prev.moods.filter(m => m !== mood)
          : [...prev.moods, mood]
      };
    });
  };
  
  const resetAllFilters = () => {
    setActiveFilters({
      genres: [],
      moods: [],
      bpmRange: [minBpm, maxBpm],
      priceRange: [0, beats ? Math.max(...beats.map(beat => beat.price)) : 1000],
      sortBy: "newest"
    });
    setSearchQuery("");
  };
  
  const hasActiveFilters = 
    activeFilters.genres.length > 0 || 
    activeFilters.moods.length > 0 || 
    activeFilters.bpmRange[0] > minBpm || 
    activeFilters.bpmRange[1] < maxBpm || 
    activeFilters.priceRange[0] > 0 ||
    activeFilters.priceRange[1] < (beats ? Math.max(...beats.map(beat => beat.price)) : 1000) ||
    searchQuery.length > 0;

  return (
    <div className="container py-8 pb-32">
      <div className="flex flex-col gap-6 md:flex-row md:justify-between md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Browse Beats</h1>
          <p className="text-muted-foreground mt-1">Find the perfect beat for your next project</p>
        </div>
        
        <div className="flex gap-2 items-center">
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search beats..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full"
            />
            {searchQuery && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6" 
                onClick={() => setSearchQuery("")}
              >
                <XIcon className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="flex-shrink-0">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Filter Beats</SheetTitle>
              </SheetHeader>
              
              <Tabs defaultValue="genres" className="mt-4">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="genres">Genres</TabsTrigger>
                  <TabsTrigger value="moods">Moods</TabsTrigger>
                  <TabsTrigger value="specs">Specs</TabsTrigger>
                </TabsList>
                
                <TabsContent value="genres" className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {allGenres.map(genre => (
                      <Button
                        key={genre}
                        variant={activeFilters.genres.includes(genre) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleGenreFilter(genre)}
                        className="justify-start"
                      >
                        {genre}
                      </Button>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="moods" className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {allMoods.map(mood => (
                      <Button
                        key={mood}
                        variant={activeFilters.moods.includes(mood) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleMoodFilter(mood)}
                        className="justify-start"
                      >
                        {mood}
                      </Button>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="specs" className="mt-4 space-y-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">BPM Range</label>
                        <span className="text-sm text-muted-foreground">
                          {activeFilters.bpmRange[0]} - {activeFilters.bpmRange[1]} BPM
                        </span>
                      </div>
                      <Slider 
                        min={minBpm} 
                        max={maxBpm} 
                        step={1}
                        value={[activeFilters.bpmRange[0], activeFilters.bpmRange[1]]}
                        onValueChange={(value) => setActiveFilters(prev => ({
                          ...prev, 
                          bpmRange: [value[0], value[1]]
                        }))}
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Price Range</label>
                        <span className="text-sm text-muted-foreground">
                          ${activeFilters.priceRange[0]} - ${activeFilters.priceRange[1]}
                        </span>
                      </div>
                      <Slider 
                        min={0} 
                        max={beats ? Math.max(...beats.map(beat => beat.price)) : 1000} 
                        step={1}
                        value={[activeFilters.priceRange[0], activeFilters.priceRange[1]]}
                        onValueChange={(value) => setActiveFilters(prev => ({
                          ...prev, 
                          priceRange: [value[0], value[1]]
                        }))}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="mt-6">
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select 
                  value={activeFilters.sortBy}
                  onValueChange={(value) => setActiveFilters(prev => ({
                    ...prev,
                    sortBy: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="title-asc">Title: A to Z</SelectItem>
                    <SelectItem value="title-desc">Title: Z to A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <SheetFooter className="mt-6 flex flex-row gap-2 sm:justify-start">
                <Button onClick={resetAllFilters} variant="outline">Reset All</Button>
                <SheetClose asChild>
                  <Button>Apply Filters</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          
          <Select 
            value={activeFilters.sortBy}
            onValueChange={(value) => setActiveFilters(prev => ({
              ...prev,
              sortBy: value
            }))}
          >
            <SelectTrigger className="w-[130px] hidden md:flex">
              <div className="flex items-center gap-1">
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span>Sort</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="title-asc">Title: A to Z</SelectItem>
              <SelectItem value="title-desc">Title: Z to A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {hasActiveFilters && (
        <div className="mb-6">
          <div className="flex gap-2 flex-wrap items-center">
            <p className="text-sm font-medium">Active Filters:</p>
            
            {searchQuery && (
              <Badge variant="secondary" className="flex gap-1 items-center">
                Search: {searchQuery}
                <button onClick={() => setSearchQuery("")}>
                  <XIcon className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {activeFilters.genres.map(genre => (
              <Badge key={genre} variant="secondary" className="flex gap-1 items-center">
                {genre}
                <button onClick={() => toggleGenreFilter(genre)}>
                  <XIcon className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            
            {activeFilters.moods.map(mood => (
              <Badge key={mood} variant="secondary" className="flex gap-1 items-center">
                {mood}
                <button onClick={() => toggleMoodFilter(mood)}>
                  <XIcon className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            
            {(activeFilters.bpmRange[0] > minBpm || activeFilters.bpmRange[1] < maxBpm) && (
              <Badge variant="secondary">
                BPM: {activeFilters.bpmRange[0]} - {activeFilters.bpmRange[1]}
              </Badge>
            )}
            
            {(activeFilters.priceRange[0] > 0 || activeFilters.priceRange[1] < (beats ? Math.max(...beats.map(beat => beat.price)) : 1000)) && (
              <Badge variant="secondary">
                Price: ${activeFilters.priceRange[0]} - ${activeFilters.priceRange[1]}
              </Badge>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs"
              onClick={resetAllFilters}
            >
              Clear All
            </Button>
          </div>
        </div>
      )}
      
      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="p-4 text-destructive">
            <p>An error occurred: {error.message}</p>
          </CardContent>
        </Card>
      )}
      
      {filteredBeats?.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Music2Icon className="h-12 w-12 text-muted-foreground mb-2" />
          <h3 className="text-xl font-medium">No beats found</h3>
          <p className="text-muted-foreground mt-1 max-w-md">
            {hasActiveFilters 
              ? "Try adjusting your filters or search query to find more beats."
              : "There are no beats available yet. Check back soon for new beats."}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" className="mt-4" onClick={resetAllFilters}>
              Reset Filters
            </Button>
          )}
        </div>
      )}
      
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <BeatSkeleton key={i} />)
          : filteredBeats?.map((beat) => (
              <BeatCard 
                key={beat.id} 
                beat={beat} 
                isPlaying={currentBeat?.id === beat.id}
                onPlay={handlePlayBeat}
                onPause={handlePauseBeat}
              />
            ))}
      </div>
      
      {/* Display count of beats matching filters */}
      {!loading && filteredBeats.length > 0 && (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Showing {filteredBeats.length} {filteredBeats.length === 1 ? 'beat' : 'beats'}
          {beats && beats.length !== filteredBeats.length ? ` out of ${beats.length} total` : ''}
        </div>
      )}
      
      {/* Audio Player */}
      {currentBeat && filteredBeats.length > 0 && (
        <AudioPlayer
          currentBeat={currentBeat}
          beats={filteredBeats}
          onPlayNext={handlePlayBeat}
          onPlayPrevious={handlePlayBeat}
          onStop={handleStopPlayback}
        />
      )}
    </div>
  );
} 