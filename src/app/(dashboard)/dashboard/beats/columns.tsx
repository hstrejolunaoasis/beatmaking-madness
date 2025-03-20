"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Play, Pause, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils/format";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BeatDialog } from "./beat-dialog";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { deleteBeat } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { getSecureMediaUrl } from "@/lib/utils/media";

interface BeatDeleteProp {
  id: string;
}

export const BeatDelete = ({ id }: BeatDeleteProp) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onDelete = async () => {
    try {
      setLoading(true);
      await deleteBeat(id);
      router.refresh();
      toast({
        title: "Success",
        description: "Beat deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete beat",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={loading}
      onClick={onDelete}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
};

export const BeatColumns: ColumnDef<any>[] = [
  {
    accessorKey: "imageUrl",
    header: "Image",
    cell: ({ row }) => {
      return (
        <Avatar className="h-12 w-12 rounded-md">
          <AvatarImage src={getSecureMediaUrl(row.original.imageUrl)} alt={row.original.title} />
          <AvatarFallback className="rounded-md">{row.original.title.charAt(0)}</AvatarFallback>
        </Avatar>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "producer",
    header: "Producer",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.original.description || "No description";
      return (
        <span className="line-clamp-2 max-w-[200px]" title={description}>
          {description}
        </span>
      );
    },
  },
  {
    accessorKey: "price",
    header: "Base Price",
    cell: ({ row }) => formatPrice(row.original.price),
  },
  {
    accessorKey: "bpm",
    header: "BPM",
  },
  {
    accessorKey: "key",
    header: "Key",
  },
  {
    accessorKey: "genre",
    header: "Genre",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.genre}</Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const beat = row.original;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            title="Preview"
          >
            <Play className="h-4 w-4" />
          </Button>
          <BeatDialog data={beat}>
            <Button
              variant="ghost"
              size="icon"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </BeatDialog>
          <BeatDelete id={beat.id} />
        </div>
      );
    },
  },
]; 