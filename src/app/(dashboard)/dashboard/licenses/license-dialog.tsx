'use client'
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";
import { LicenseForm } from "@/components/forms/license-form";
import { License } from "@/lib/api-client";

interface LicenseDialogProps {
  initialData?: License | null;
  trigger?: React.ReactNode;
  title?: string;
}

export const LicenseDialog = ({
  initialData,
  trigger,
  title = "Add New License",
}: LicenseDialogProps) => {
  const [open, setOpen] = useState(false);

  const defaultTrigger = (
    <Button size="sm">
      <PlusIcon className="mr-2 h-4 w-4" />
      Add New
    </Button>
  );

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {initialData 
              ? "Edit the details of your license." 
              : "Create a new license to offer with your beats."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <LicenseForm 
            initialData={initialData}
            onSuccess={handleSuccess}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}; 