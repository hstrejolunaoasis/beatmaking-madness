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
import { Loader2, PlusIcon } from "lucide-react";
import { LicenseTypeForm } from "@/components/forms/license-type-form";
import { LicenseType } from "@/lib/api-client";

interface LicenseTypeDialogProps {
  initialData?: LicenseType | null;
  trigger?: React.ReactNode;
  title?: string;
}

export const LicenseTypeDialog = ({
  initialData,
  trigger,
  title = "Add New License Type",
}: LicenseTypeDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const defaultTrigger = (
    <Button size="sm">
      <PlusIcon className="mr-2 h-4 w-4" />
      Add New
    </Button>
  );

  const handleFormProcessing = (processing: boolean) => {
    setIsProcessing(processing);
  };

  const handleSuccess = () => {
    setOpen(false);
    setIsProcessing(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      // Prevent closing dialog while processing
      if (isProcessing && !isOpen) return;
      setOpen(isOpen);
    }}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        {isProcessing && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
            <div className="flex flex-col items-center gap-2 text-center p-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">
                {initialData ? "Updating license type..." : "Creating license type..."}
              </p>
              <p className="text-xs text-muted-foreground">
                This may take a moment
              </p>
            </div>
          </div>
        )}
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {initialData 
              ? "Edit the details of your license type" 
              : "Create a new license type for your beats"}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <LicenseTypeForm 
            initialData={initialData}
            onSuccess={handleSuccess}
            onLoadingChange={handleFormProcessing}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}; 