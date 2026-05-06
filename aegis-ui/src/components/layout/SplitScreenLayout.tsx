"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SplitScreenLayoutProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  className?: string;
}

export default function SplitScreenLayout({ leftPanel, rightPanel, className }: SplitScreenLayoutProps) {
  return (
    <div className={cn("flex flex-col md:flex-row h-screen w-full overflow-hidden", className)}>
      <div className="w-full md:w-1/2 h-full border-r border-gray-200 overflow-auto bg-white p-4">
        {leftPanel}
      </div>
      <div className="w-full md:w-1/2 h-full overflow-auto bg-gray-50 p-4">
        {rightPanel}
      </div>
    </div>
  );
}
