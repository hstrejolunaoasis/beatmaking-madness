import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { createLicenseType, updateLicenseType, LicenseType } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, {
    message: "Slug can only contain lowercase letters, numbers, and hyphens",
  }),
  description: z.string().optional(),
});

type LicenseTypeFormValues = z.infer<typeof formSchema>;

interface LicenseTypeFormProps {
  initialData?: LicenseType | null;
  onSuccess?: () => void;
  onLoadingChange?: (loading: boolean) => void;
}

export const LicenseTypeForm: React.FC<LicenseTypeFormProps> = ({
  initialData,
  onSuccess,
  onLoadingChange,
}) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const title = initialData ? "Edit License Type" : "Create License Type";
  const description = initialData
    ? "Edit an existing license type"
    : "Add a new license type";
  const action = initialData ? "Save changes" : "Create";

  const defaultValues = initialData
    ? {
        ...initialData,
        description: initialData.description || "",
      }
    : {
        name: "",
        slug: "",
        description: "",
      };

  const form = useForm<LicenseTypeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: LicenseTypeFormValues) => {
    try {
      setLoading(true);
      if (onLoadingChange) onLoadingChange(true);

      // Show processing toast
      const loadingToast = toast({
        title: initialData ? "Updating license type..." : "Creating license type...",
        description: "Please wait while we process your request.",
      });

      // Use API client to create or update license type
      if (initialData) {
        await updateLicenseType(initialData.id, data);
      } else {
        await createLicenseType(data);
      }

      // Show success toast
      toast({
        title: "Success",
        description: `License type ${initialData ? "updated" : "created"} successfully.`,
      });

      // Refresh data or redirect
      router.refresh();

      // Call onSuccess if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.response?.data || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      if (onLoadingChange) onLoadingChange(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Auto-generate slug from name if slug is empty
    const currentSlug = form.getValues("slug");
    if (!currentSlug && !initialData) {
      const nameValue = e.target.value;
      const slug = nameValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      form.setValue("slug", slug, { shouldValidate: true });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Heading title={title} description={description} />
        <Separator className="my-4" />
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="License type name"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleNameChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="license-type-slug"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Used in URLs and for identification. Use lowercase letters, numbers, and hyphens only.
                  </p>
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    disabled={loading}
                    placeholder="Describe this license type"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="mt-4"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {initialData ? "Saving..." : "Creating..."}
              </>
            ) : (
              action
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}; 