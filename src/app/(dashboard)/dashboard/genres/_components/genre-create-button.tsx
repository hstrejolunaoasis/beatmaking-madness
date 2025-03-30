"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { GenreCreateDialog } from "./genre-create-dialog";

export function GenreCreateButton() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <>
      <Button onClick={() => setShowCreateDialog(true)}>
        <PlusIcon className="mr-2 h-4 w-4" />
        Add Genre
      </Button>

      <GenreCreateDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />
    </>
  );
} 