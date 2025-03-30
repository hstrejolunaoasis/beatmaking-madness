import { useState, useEffect } from "react";
import { getLicenses, License } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface LicenseSelectorProps {
  onSelect: (license: License) => void;
  selectedLicenseId?: string;
  beatPrice?: number;
}

export const LicenseSelector = ({ onSelect, selectedLicenseId, beatPrice = 0 }: LicenseSelectorProps) => {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLicenses = async () => {
      try {
        setLoading(true);
        const data = await getLicenses();
        // Only show active licenses and sort by price
        const activeLicenses = data
          .filter(license => license.active)
          .sort((a, b) => a.price - b.price);
        setLicenses(activeLicenses);
      } catch (err) {
        setError("Failed to load license options");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLicenses();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-2 border-transparent">
            <CardHeader>
              <Skeleton className="h-5 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
      {licenses.map((license) => {
        const isSelected = license.id === selectedLicenseId;
        const totalPrice = license.price + beatPrice;
        
        return (
          <Card 
            key={license.id} 
            className={`border-2 ${isSelected ? 'border-primary' : 'border-transparent'} transition-all hover:shadow-md cursor-pointer`}
            onClick={() => onSelect(license)}
          >
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{license.name}</CardTitle>
                <Badge variant={getLicenseVariant(license.type)}>
                  {license.type}
                </Badge>
              </div>
              <CardDescription>
                {formatCurrency(totalPrice)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {license.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckIcon className="mr-2 h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                variant={isSelected ? "default" : "outline"} 
                className="w-full"
                onClick={() => onSelect(license)}
              >
                {isSelected ? "Selected" : "Select License"}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

// Helper functions
const getLicenseVariant = (type: string) => {
  switch (type) {
    case "basic":
      return "secondary";
    case "premium":
      return "default";
    case "exclusive":
      return "destructive";
    default:
      return "outline";
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}; 