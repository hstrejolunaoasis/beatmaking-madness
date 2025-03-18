import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { createLicense, updateLicense, License as LicenseType, getLicenseTypes, LicenseType as LicenseTypeModel } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  licenseTypeId: z.string().min(1, "License type is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().min(0, "Price must be at least 0"),
  features: z.string().min(1, "Features are required"),
  active: z.boolean().default(true),
});

type LicenseFormValues = z.infer<typeof formSchema>;

interface LicenseFormProps {
  initialData?: LicenseType | null;
  onSuccess?: () => void;
  onLoadingChange?: (loading: boolean) => void;
}

export const LicenseForm: React.FC<LicenseFormProps> = ({ 
  initialData,
  onSuccess,
  onLoadingChange
}) => {
  const [loading, setLoading] = useState(false);
  const [licenseTypes, setLicenseTypes] = useState<LicenseTypeModel[]>([]);
  const [loadingLicenseTypes, setLoadingLicenseTypes] = useState(false);
  const router = useRouter();

  const title = initialData ? "Edit License" : "Create License";
  const description = initialData ? "Edit a license" : "Add a new license";
  const action = initialData ? "Save changes" : "Create";

  useEffect(() => {
    const fetchLicenseTypes = async () => {
      try {
        setLoadingLicenseTypes(true);
        const data = await getLicenseTypes();
        setLicenseTypes(data);
      } catch (error) {
        console.error("Failed to fetch license types:", error);
        toast({
          title: "Error",
          description: "Failed to load license types. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoadingLicenseTypes(false);
      }
    };

    fetchLicenseTypes();
  }, []);

  const defaultValues = initialData
    ? {
        ...initialData,
        features: initialData.features.join("\n"),
      }
    : {
        name: "",
        licenseTypeId: "",
        description: "",
        price: 0,
        features: "",
        active: true,
      };

  const form = useForm<LicenseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: LicenseFormValues) => {
    try {
      setLoading(true);
      if (onLoadingChange) onLoadingChange(true);
      
      // Show processing toast
      const loadingToast = toast({
        title: initialData ? "Updating license..." : "Creating license...",
        description: "Please wait while we process your request.",
      });
      
      // Transform features from string to array
      const transformedData = {
        ...data,
        features: data.features.split("\n").filter(Boolean),
      };
      
      // Use API client to create or update license
      if (initialData) {
        await updateLicense(initialData.id, transformedData);
      } else {
        await createLicense(transformedData);
      }
      
      // Show success toast
      toast({
        title: "Success",
        description: `License ${initialData ? "updated" : "created"} successfully.`,
      });
      
      // Refresh data or redirect
      router.refresh();
      
      // Call onSuccess if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      if (onLoadingChange) onLoadingChange(false);
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
                      placeholder="License name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="licenseTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Type</FormLabel>
                  <Select
                    disabled={loading || loadingLicenseTypes}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a license type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingLicenseTypes ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span>Loading types...</span>
                        </div>
                      ) : licenseTypes.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          No license types found
                        </div>
                      ) : (
                        licenseTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (USD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={loading}
                      placeholder="9.99"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    disabled={loading}
                    placeholder="License description"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="features"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Features (one per line)</FormLabel>
                <FormControl>
                  <Textarea
                    disabled={loading}
                    placeholder="- Feature 1&#10;- Feature 2&#10;- Feature 3"
                    {...field}
                    className="min-h-[120px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            className="mt-4" 
            disabled={loading || loadingLicenseTypes}
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