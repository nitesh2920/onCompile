import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export  function CompilerSkeleton() {
  return (
    <div className="mx-auto px-4 py-6 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex  sm:items-center justify-between sm:gap-4">
                {/* Language Selector & Run Button */}
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-40 rounded-md" />
                  <Skeleton className="h-9 w-24 rounded-md" />
                </div>

                {/* Desktop buttons */}
                <div className="hidden sm:flex items-center gap-2">
                  <Skeleton className="h-9 w-20 rounded-md" />
                  <Skeleton className="h-9 w-20 rounded-md" />
                  <Skeleton className="h-9 w-28 rounded-md" />
                  <Skeleton className="h-9 w-20 rounded-md" />
                </div>

                {/* Mobile menu icon */}
                <div className="sm:hidden flex">
                  <Skeleton className="h-9 w-9 rounded-md" />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Code Editor Skeleton */}
          <div className="relative">
            <Skeleton className="h-[500px] w-full rounded-md" />
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="space-y-4">
          {/* Output */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Output</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full rounded-lg" />
            </CardContent>
          </Card>

          {/* Input (stdin) */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Input (stdin)</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[120px] w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
