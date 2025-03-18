'use client'
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LicenseType, deleteLicenseType } from "@/lib/api-client";
import { LicenseTypeDialog } from "./license-type-dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
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

export const columns: ColumnDef<LicenseType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "slug",
    header: "Slug",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue("description") as string | null;
      return <div>{description || "-"}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const licenseType = row.original;
      const router = useRouter();
      const [loading, setLoading] = useState(false);
      const [showDeleteAlert, setShowDeleteAlert] = useState(false);
      
      const handleDelete = async () => {
        try {
          setLoading(true);
          
          // Show loading toast
          toast({
            title: "Deleting license type...",
            description: "Please wait while we process your request.",
          });
          
          await deleteLicenseType(licenseType.id);
          
          // Update toast to success
          toast({
            title: "Success",
            description: "License type deleted successfully.",
          });
          
          router.refresh();
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.response?.data || "Failed to delete license type.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
          setShowDeleteAlert(false);
        }
      };

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-8 w-8 p-0 hover:bg-muted focus-visible:ring-1 focus-visible:ring-primary" 
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MoreHorizontal className="h-4 w-4" />
                )}
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium leading-none mb-1">License Type Actions</p>
                <p className="text-xs text-muted-foreground truncate">{licenseType.name}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <LicenseTypeDialog 
                  initialData={licenseType} 
                  title="Edit License Type"
                  trigger={
                    <button 
                      className="w-full text-left cursor-pointer flex items-center px-2 py-1.5 hover:bg-muted focus:bg-muted transition-colors"
                      disabled={loading}
                    >
                      <Edit className="h-4 w-4 mr-2 text-primary" />
                      <span>Edit license type</span>
                    </button>
                  }
                />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowDeleteAlert(true)}
                disabled={loading}
                className="flex items-center px-2 py-1.5 cursor-pointer focus:bg-destructive/10 hover:bg-destructive/10 text-destructive hover:text-destructive"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                <span>{loading ? 'Deleting...' : 'Delete license type'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
            <AlertDialogContent>
              {loading && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
                  <div className="flex flex-col items-center gap-2 text-center p-4">
                    <Loader2 className="h-8 w-8 animate-spin text-destructive" />
                    <p className="text-sm font-medium">Deleting license type...</p>
                    <p className="text-xs text-muted-foreground">This may take a moment</p>
                  </div>
                </div>
              )}
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the license type <span className="font-medium">{licenseType.name}</span>. 
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={loading}
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    handleDelete();
                  }}
                  className="bg-destructive hover:bg-destructive/90 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      );
    },
  },
]; 