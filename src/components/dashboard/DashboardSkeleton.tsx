// ruta: src/components/dashboard/DashboardSkeleton.tsx

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton"; // Asumo que tienes este componente de shadcn/ui

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Skeleton for Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-5 w-2/5" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-7 w-3/5" />
              <Skeleton className="h-4 w-4/5" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Skeleton for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-5 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}