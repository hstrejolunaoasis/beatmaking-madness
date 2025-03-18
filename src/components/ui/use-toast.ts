import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

// Create a compatibility layer for existing code
export function toast({ title, description, variant }: ToastProps) {
  if (variant === "destructive") {
    return sonnerToast.error(title, {
      description,
    });
  }
  
  return sonnerToast(title, {
    description,
  });
} 