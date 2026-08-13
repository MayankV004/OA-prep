import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton, SkeletonCard, SkeletonRows } from '@/components/ui/skeleton';

/** Chart card placeholder: title + description lines over a plot-sized block. */
function SkeletonChartCard({
  className,
  height = 'h-[200px]',
  children,
}: {
  className?: string;
  height?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className={className}>
      <CardHeader className="space-y-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-52 max-w-full" />
      </CardHeader>
      <CardContent>
        {children ?? <Skeleton className={`${height} w-full`} />}
      </CardContent>
    </Card>
  );
}

export default function DashboardLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
      {/* PageHeading */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-3 w-64 max-w-full" />
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Row 1: trend + activity feed */}
      <div className="grid gap-4 lg:grid-cols-7">
        <SkeletonChartCard className="min-w-0 lg:col-span-4" />
        <SkeletonChartCard className="min-w-0 lg:col-span-3">
          <SkeletonRows rows={5} />
        </SkeletonChartCard>
      </div>

      {/* Row 2: group progress + difficulty mix */}
      <div className="grid gap-4 lg:grid-cols-7">
        <SkeletonChartCard className="min-w-0 lg:col-span-4" />
        <SkeletonChartCard className="min-w-0 lg:col-span-3">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-16" />
              ))}
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        </SkeletonChartCard>
      </div>

      {/* Heatmap */}
      <SkeletonChartCard className="min-w-0" height="h-24" />
    </div>
  );
}
