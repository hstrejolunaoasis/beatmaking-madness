'use client'

import { Heading } from "@/components/ui/heading";
import { LicenseDialog } from "../license-dialog";

interface LicenseHeaderProps {
  title: string;
  description: string;
}

export const LicenseHeader = ({
  title,
  description
}: LicenseHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <Heading
        title={title}
        description={description}
      />
      <LicenseDialog />
    </div>
  );
}; 