import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { db } from "@/lib/db";
import { columns } from "./columns";
import { LicenseTypeHeader } from "./components/license-type-header";

export const metadata = {
  title: "License Type Management",
  description: "Manage license types for your beats",
};

export default async function LicenseTypesPage() {
  const licenseTypes = await db.licenseType.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <LicenseTypeHeader
          title="License Types"
          description="Manage the types of licenses you offer"
        />
        <Separator />
        <DataTable 
          columns={columns} 
          data={licenseTypes} 
          searchKey="name"
        />
      </div>
    </div>
  );
} 