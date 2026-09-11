'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Users,
  Award,
  ShieldCheck,
  Radio,
  Plus,
  ArrowRight,
  Clock,
  ExternalLink,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PortalOverviewPage() {
  const searchParams = useSearchParams();
  const instId = searchParams.get('institutionId');

  const { data, isLoading } = useQuery({
    queryKey: ['portal-overview-data', instId],
    queryFn: async () => {
      const url = instId ? `/api/portal/overview?institutionId=${instId}` : '/api/portal/overview';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load overview');
      return res.json();
    },
  });

  const institution = data?.institution;
  const metrics = data?.metrics;
  const upcomingDrives = data?.upcomingDrives || [];
  const currentRole = data?.currentRole;

  const buildHref = (path: string) => (instId ? `${path}?institutionId=${instId}` : path);

  const used = institution?.usedSeats || 0;
  const total = institution?.totalSeats || 100;
  const seatPct = Math.min(100, Math.round((used / (total || 1)) * 100));

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {institution?.name || 'Campus'} Placement Control Room
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Enterprise campus placement portal for scheduling coding rounds, live invigilation, and exporting placement scorecards.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {currentRole !== 'invigilator' && (
            <Link href={buildHref('/portal/drives')}>
              <Button size="sm">
                <Plus className="mr-1.5 h-4 w-4" />
                Schedule Drive
              </Button>
            </Link>
          )}
          <Link href={buildHref('/portal/results')}>
            <Button variant="outline" size="sm">
              <Award className="mr-1.5 h-4 w-4" />
              Scorecards
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Seat Allocation Card */}
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Student Seat Licenses
            </CardTitle>
            <span className="text-xs font-mono font-medium">{seatPct}% Used</span>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">{used} / {total}</div>
              <span className="text-xs text-muted-foreground font-mono">
                {metrics?.seatsRemaining ?? 0} seats open
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all',
                  seatPct > 90 ? 'bg-rose-500' : seatPct > 70 ? 'bg-amber-500' : 'bg-primary'
                )}
                style={{ width: `${seatPct}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Total Drives Card */}
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              Placement Drives
            </CardTitle>
            {metrics?.liveDrivesCount > 0 && (
              <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-500 text-[10px] animate-pulse">
                <Radio className="mr-1 h-2.5 w-2.5" /> {metrics.liveDrivesCount} Live
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalDrives ?? 0}</div>
            <p className="mt-1 text-xs text-muted-foreground">Scheduled or conducted drives</p>
          </CardContent>
        </Card>

        {/* Candidates Assessed Card */}
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4 text-emerald-500" />
              Candidates Assessed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(metrics?.totalAssessed ?? 0).toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Completed student test submissions</p>
          </CardContent>
        </Card>

        {/* Integrity Flags Card */}
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Proctoring Integrity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.flaggedIncidents === 0 ? '100% Clean' : `${metrics?.flaggedIncidents} Flagged`}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">AI biometric & tab audit flags</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming / Active Drives Section */}
      <Card className="border-border/60 bg-card/60">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Placement Testing Windows
            </CardTitle>
            <CardDescription className="text-xs">
              Live and upcoming cohort rounds scheduled for your campus students.
            </CardDescription>
          </div>
          <Link href={buildHref('/portal/drives')}>
            <Button variant="ghost" size="sm" className="text-xs">
              View All Drives <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {upcomingDrives.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground space-y-3">
              <p>No active or scheduled drives for this campus.</p>
              {currentRole !== 'invigilator' && (
                <Link href={buildHref('/portal/drives')}>
                  <Button size="sm" variant="outline" className="text-xs">
                    <Plus className="mr-1 h-3 w-3" /> Schedule First Placement Drive
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {upcomingDrives.map((d: any) => (
                <div key={d._id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-xs font-semibold text-foreground flex items-center gap-2">
                      <span>{d.title}</span>
                      {d.status === 'live' ? (
                        <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-500 text-[10px] animate-pulse">
                          <Radio className="mr-1 h-2.5 w-2.5" /> LIVE NOW
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {d.status}
                        </Badge>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Assessment: {d.assessmentId?.title || 'Coding Test'} • Duration: {d.durationMinutes} mins •{' '}
                      {format(new Date(d.startsAt), 'MMM d, h:mm a')} – {format(new Date(d.endsAt), 'h:mm a')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={buildHref(`/portal/drives/${d._id}`)}>
                      <Button size="sm" variant={d.status === 'live' ? 'default' : 'outline'} className="h-7 text-xs">
                        {d.status === 'live' ? 'Enter Invigilation Room' : 'View Test Window'}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
