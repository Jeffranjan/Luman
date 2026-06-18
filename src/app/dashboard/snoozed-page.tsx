"use client";

import { Clock } from "lucide-react";

export default function SnoozedPage() {
  return (
    <div className="flex flex-col h-full w-full bg-background">
      <header className="flex items-center px-6 h-14 border-b shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <h1 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Snoozed
        </h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
        <Clock className="w-12 h-12 mb-4 opacity-30" />
        <p>Snoozed emails will appear here</p>
        <p className="text-sm mt-1">Press <kbd className="px-1.5 py-0.5 rounded border text-xs">S</kbd> on any thread to snooze it</p>
      </div>
    </div>
  );
}
