'use client'
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Copy, Edit, Trash2, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { License } from "@/lib/api-client";
import { LicenseDialog } from "./license-dialog";
import { deleteLicense, duplicateLicense } from "@/lib/api-client";
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

export const columns: ColumnDef<License>[] = [
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
    accessorKey: "licenseType",
    header: "License Type",
    cell: ({ row }) => {
      const licenseType = row.getValue("licenseType") as License["licenseType"];
      return (
        <div className="capitalize">{licenseType?.name || "Unknown"}</div>
      );
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Price
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price);
      return <div>{formatted}</div>;
    },
  },
  {
    accessorKey: "active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("active");
      return (
        <Badge variant={isActive ? "default" : "destructive"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
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
      const license = row.original;
      const router = useRouter();
      const [loading, setLoading] = useState(false);
      const [actionType, setActionType] = useState<'delete' | 'duplicate' | null>(null);
      const [showDeleteAlert, setShowDeleteAlert] = useState(false);
      
      const handleDelete = async () => {
        try {
          setLoading(true);
          setActionType('delete');
          
          // Show loading toast
          toast({
            title: "Deleting license...",
            description: "Please wait while we process your request.",
          });
          
          await deleteLicense(license.id);
          
          // Update toast to success
          toast({
            title: "Success",
            description: "License deleted successfully.",
          });
          
          router.refresh();
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to delete license.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
          setActionType(null);
          setShowDeleteAlert(false);
        }
      };
      
      const handleDuplicate = async () => {
        try {
          setLoading(true);
          setActionType('duplicate');
          
          // Show loading toast
          toast({
            title: "Duplicating license...",
            description: "Please wait while we process your request.",
          });
          
          await duplicateLicense(license.id);
          
          // Update toast to success
          toast({
            title: "Success",
            description: "License duplicated successfully.",
          });
          
          router.refresh();
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to duplicate license.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
          setActionType(null);
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
                <p className="text-sm font-medium leading-none mb-1">License Actions</p>
                <p className="text-xs text-muted-foreground truncate">{license.name}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <LicenseDialog 
                  initialData={license} 
                  title="Edit License"
                  trigger={
                    <button 
                      className="w-full text-left cursor-pointer flex items-center px-2 py-1.5 hover:bg-muted focus:bg-muted transition-colors"
                      disabled={loading}
                    >
                      <Edit className="h-4 w-4 mr-2 text-primary" />
                      <span>Edit license</span>
                    </button>
                  }
                />
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDuplicate}
                disabled={loading}
                className="flex items-center cursor-pointer px-2 py-1.5"
              >
                {loading && actionType === 'duplicate' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Copy className="h-4 w-4 mr-2 text-muted-foreground" />
                )}
                <span>{loading && actionType === 'duplicate' ? 'Duplicating...' : 'Duplicate license'}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowDeleteAlert(true)}
                disabled={loading}
                className="flex items-center px-2 py-1.5 cursor-pointer focus:bg-destructive/10 hover:bg-destructive/10 text-destructive hover:text-destructive"
              >
                {loading && actionType === 'delete' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                <span>{loading && actionType === 'delete' ? 'Deleting...' : 'Delete license'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
            <AlertDialogContent>
              {loading && actionType === 'delete' && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
                  <div className="flex flex-col items-center gap-2 text-center p-4">
                    <Loader2 className="h-8 w-8 animate-spin text-destructive" />
                    <p className="text-sm font-medium">Deleting license...</p>
                    <p className="text-xs text-muted-foreground">This may take a moment</p>
                  </div>
                </div>
              )}
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the license <span className="font-medium">{license.name}</span>. 
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
                  {loading && actionType === 'delete' ? (
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