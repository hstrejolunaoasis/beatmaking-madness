"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BeatForm } from "@/components/forms/beat-form";

interface BeatDialogProps {
  children: React.ReactNode;
  data?: any;
}

export function BeatDialog({ children, data }: BeatDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  const handleLoadingChange = (isLoading: boolean) => {
    setLoading(isLoading);
  };

  const title = data ? "Edit Beat" : "Add New Beat";
  const description = data
    ? "Edit your beat details and associated licenses."
    : "Add a new beat to your catalog with license options.";

  return (
    <Dialog open={open} onOpenChange={loading ? undefined : setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <BeatForm
          initialData={data}
          onSuccess={handleSuccess}
          onLoadingChange={handleLoadingChange}
        />
      </DialogContent>
    </Dialog>
  );
} 