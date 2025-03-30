"use client";

import { useState } from "react";
import { GenreWithBeatsCount } from "@/types/genre";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { GenreActions } from "./genre-actions";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface GenresListProps {
  initialGenres: GenreWithBeatsCount[];
}

export function GenresList({ initialGenres }: GenresListProps) {
  const [genres, setGenres] = useState<GenreWithBeatsCount[]>(initialGenres);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  const filteredGenres = genres.filter((genre) => {
    const matchesSearch = genre.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (genre.description?.toLowerCase() || "").includes(debouncedSearch.toLowerCase());
    const matchesActiveFilter = showOnlyActive ? genre.active : true;
    return matchesSearch && matchesActiveFilter;
  });

  const onGenreUpdated = (updatedGenre: GenreWithBeatsCount) => {
    setGenres(genres.map(genre => 
      genre.id === updatedGenre.id ? updatedGenre : genre
    ));
  };

  const onGenreDeleted = (id: string) => {
    setGenres(genres.filter(genre => genre.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Genres</CardTitle>
        <CardDescription>Manage your music genres collection</CardDescription>
        
        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-4">
          <div className="relative w-full sm:w-64">
            <Input
              placeholder="Search genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="active-filter"
              checked={showOnlyActive}
              onCheckedChange={setShowOnlyActive}
            />
            <Label htmlFor="active-filter">Show only active</Label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Beats</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGenres.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No genres found
                </TableCell>
              </TableRow>
            ) : (
              filteredGenres.map((genre) => (
                <TableRow key={genre.id}>
                  <TableCell className="font-medium">{genre.name}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {genre.description || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={genre.active ? "success" : "secondary"}>
                      {genre.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{genre._count?.beats || 0}</TableCell>
                  <TableCell>
                    {format(new Date(genre.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <GenreActions 
                      genre={genre} 
                      onDelete={onGenreDeleted}
                      onUpdate={onGenreUpdated}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 