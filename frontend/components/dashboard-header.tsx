"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  imageUrl?: string;
  imageAvailable?: boolean;
}

export function DashboardHeader({
  title,
  description,
  action,
  imageUrl,
  imageAvailable = false,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 shadow-md p-4 rounded-sm border md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4 flex-col sm:flex-row text-center sm:text-left">
      {imageAvailable && imageUrl && (
        <img
        src={imageUrl}
        alt="Header"
        className="w-16 h-16 rounded-full object-cover mx-auto sm:mx-0"
        />
      )}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      </div>
      {action && (
      <Button
        onClick={action.onClick}
        className="w-full sm:w-auto"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        {action.label}
      </Button>
      )}
    </div>
  );
}
