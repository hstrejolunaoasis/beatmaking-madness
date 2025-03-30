'use client'

import { Heading } from "@/components/ui/heading";
import { LicenseTypeDialog } from "../license-type-dialog";

interface LicenseTypeHeaderProps {
  title: string;
  description: string;
}

export const LicenseTypeHeader = ({
  title,
  description
}: LicenseTypeHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <Heading
        title={title}
        description={description}
      />
      <LicenseTypeDialog />
    </div>
  );
}; 