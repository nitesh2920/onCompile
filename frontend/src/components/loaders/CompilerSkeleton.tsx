// src/components/loaders/CompilerSkeleton.tsx
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CompilerSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Toolbar Card */}
      <Card className="border-primary/20 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-32 rounded-md" /> {/* LanguageSelector */}
            <Skeleton className="h-9 w-24 rounded-md" /> {/* Run button */}
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-20 rounded-md" /> {/* Share */}
            <Skeleton className="h-9 w-24 rounded-md" /> {/* Download */}
            <Skeleton className="h-9 w-20 rounded-md" /> {/* Save */}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Code Editor Placeholder */}
        <Card className="h-[500px]">
          <Skeleton className="h-full w-full rounded-md" />
        </Card>

        {/* Output Section Placeholder */}
        <Card className="h-[500px] p-4 space-y-4">
          <Skeleton className="h-6 w-32" /> {/* Output Title */}
          <Skeleton className="h-full w-full rounded-md" />
        </Card>
      </div>
    </div>
  );
}
