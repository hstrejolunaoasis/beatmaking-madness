"use client";

import { useState } from "react";
import { GenreWithBeatsCount } from "@/types/genre";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Icons } from "@/components/icons";

interface GenreDeleteDialogProps {
  genre: GenreWithBeatsCount;
  open: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export function GenreDeleteDialog({
  genre,
  open,
  onClose,
  onDelete,
}: GenreDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      if (genre._count.beats > 0) {
        toast.error(`Cannot delete genre "${genre.name}" as it is being used by ${genre._count.beats} beat(s)`);
        onClose();
        return;
      }
      
      const response = await fetch(`/api/genres/${genre.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete genre");
      }

      onDelete(genre.id);
      toast.success(`Genre "${genre.name}" deleted successfully`);
      onClose();
    } catch (error) {
      toast.error("Failed to delete genre");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the genre{" "}
            <span className="font-medium text-foreground">"{genre.name}"</span>{" "}
            from the database.
            {genre._count.beats > 0 && (
              <p className="mt-2 text-destructive">
                This genre cannot be deleted as it is being used by {genre._count.beats} beat(s).
                You need to reassign those beats to a different genre first.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting || genre._count.beats > 0}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 