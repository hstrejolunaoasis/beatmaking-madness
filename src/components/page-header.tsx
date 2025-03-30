"use client";

import { Heading } from "@/components/ui/heading";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function PageHeader({
  title,
  description,
  action
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <Heading
        title={title}
        description={description}
      />
      {action}
    </div>
  );
} 