import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { db } from "@/lib/db";
import { LicenseDialog } from "./license-dialog";

export const metadata = {
  title: "License Management",
  description: "Manage license types and details for beats",
};

export default async function LicensesPage() {
  const licenses = await db.license.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title="License Management"
            description="Manage your license types and details"
          />
          <LicenseDialog />
        </div>
        <Separator />
        <DataTable columns={columns} data={licenses} />
      </div>
    </div>
  );
} 