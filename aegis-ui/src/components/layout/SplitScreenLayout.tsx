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
    <div className={cn("flex flex-col md:flex-row h-screen w-full overflow-hidden bg-white dark:bg-slate-950", className)}>
      <div className="w-full md:w-1/2 h-full border-r border-slate-200 dark:border-slate-800 overflow-auto flex flex-col">
        {leftPanel}
      </div>
      <div className="w-full md:w-1/2 h-full overflow-auto flex flex-col bg-slate-50/30 dark:bg-slate-900/20">
        {rightPanel}
      </div>
    </div>
  );
}
