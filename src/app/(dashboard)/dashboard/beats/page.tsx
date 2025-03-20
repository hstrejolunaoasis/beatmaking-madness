import { Metadata } from "next";
import { redirect } from "next/navigation";

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { BeatColumns } from "./columns";
import { getCurrentUser } from "@/lib/supabase/server-actions";
import { dbService } from "@/lib/services/db.service";
import { BeatDialog } from "./beat-dialog";

export const metadata: Metadata = {
  title: "Beats | Dashboard",
  description: "Manage your beats",
};

export default async function BeatsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const beats = await dbService.getBeats();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <Heading
          title="Beats Management"
          description="Create and manage your beats"
        />
        <BeatDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Beat
          </Button>
        </BeatDialog>
      </div>
      <Separator />
      <DataTable columns={BeatColumns} data={beats} />
    </div>
  );
} 