"use client";

import { useState } from "react";
import { GenreWithBeatsCount } from "@/types/genre";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontalIcon, EditIcon, EyeOffIcon, EyeIcon, TrashIcon, Loader2 as LoaderIcon } from "lucide-react";
import { GenreEditDialog } from "./genre-edit-dialog";
import { GenreDeleteDialog } from "./genre-delete-dialog";
import { toast } from "sonner";

interface GenreActionsProps {
  genre: GenreWithBeatsCount;
  onDelete: (id: string) => void;
  onUpdate: (genre: GenreWithBeatsCount) => void;
}

export function GenreActions({ genre, onDelete, onUpdate }: GenreActionsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickToggleActive = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/genres/${genre.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          active: !genre.active,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update genre");
      }

      const updatedGenre = await response.json();
      onUpdate(updatedGenre);
      
      toast.success(
        `Genre ${updatedGenre.active ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      toast.error("Failed to update genre");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => setShowEditDialog(true)}
            disabled={isLoading}
          >
            <EditIcon className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleQuickToggleActive}
            disabled={isLoading}
          >
            {genre.active ? (
              <>
                <EyeOffIcon className="mr-2 h-4 w-4" />
                Deactivate
              </>
            ) : (
              <>
                <EyeIcon className="mr-2 h-4 w-4" />
                Activate
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            disabled={isLoading || genre._count.beats > 0}
            className="text-destructive focus:text-destructive"
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <GenreEditDialog
        genre={genre}
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onUpdate={onUpdate}
      />

      <GenreDeleteDialog
        genre={genre}
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onDelete={onDelete}
      />
    </>
  );
} 