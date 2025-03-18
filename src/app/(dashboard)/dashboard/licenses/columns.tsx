'use client'
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Copy } from "lucide-react";
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
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("type")}</div>
    ),
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
      
      const handleDelete = async () => {
        try {
          setLoading(true);
          await deleteLicense(license.id);
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
        }
      };
      
      const handleDuplicate = async () => {
        try {
          setLoading(true);
          await duplicateLicense(license.id);
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
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" disabled={loading}>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <LicenseDialog 
                initialData={license} 
                title="Edit License"
                trigger={<button className="w-full text-left cursor-pointer">Edit license</button>}
              />
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDuplicate}
              disabled={loading}
              className="flex items-center cursor-pointer"
            >
              <Copy className="h-4 w-4 mr-2" />
              Duplicate license
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleDelete}
              disabled={loading}
              className="text-destructive focus:text-destructive"
            >
              Delete license
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 