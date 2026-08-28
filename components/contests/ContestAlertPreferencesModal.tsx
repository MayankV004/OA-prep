'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/typography';
import {
  Bell,
  BellRing,
  Check,
  CheckCircle2,
  Globe,
  Loader2,
  Mail,
  Send,
  Shield,
} from 'lucide-react';

interface SubscriptionData {
  enabled: boolean;
  platforms: string[];
  leadTimes: string[];
  weeklyDigest: boolean;
  timezone: string;
  email: string;
  isAdmin?: boolean;
}

const ALL_PLATFORMS = [
  { id: 'leetcode', label: 'LeetCode', desc: 'Weekly & Biweekly' },
  { id: 'codeforces', label: 'Codeforces', desc: 'Div 1, 2, 3, 4 & Global' },
  { id: 'codechef', label: 'CodeChef', desc: 'Starters & Cook-Offs' },
  { id: 'atcoder', label: 'AtCoder', desc: 'ABC & ARC Contests' },
  { id: 'hackerearth', label: 'HackerEarth', desc: 'Challenges & OAs' },
];

const LEAD_TIMES = [
  { id: '24h', label: '24 Hours Before', desc: 'Planning ahead' },
  { id: '2h', label: '2 Hours Before', desc: 'Warmup & setup' },
  { id: '30m', label: '30 Mins Before', desc: 'Final countdown' },
];

function PreferencesForm({
  initialData,
  onClose,
}: {
  initialData: SubscriptionData;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [enabled, setEnabled] = useState(initialData.enabled);
  const [platforms, setPlatforms] = useState<string[]>(initialData.platforms || []);
  const [leadTimes, setLeadTimes] = useState<string[]>(initialData.leadTimes || []);
  const [weeklyDigest, setWeeklyDigest] = useState(initialData.weeklyDigest ?? true);
  const [timezone, setTimezone] = useState(
    initialData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata'
  );

  const [testSent, setTestSent] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: async (payload: Partial<SubscriptionData>) => {
      const res = await fetch('/api/contests/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save preferences');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contestSubscription'] });
      onClose();
    },
  });

  const testMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/contests/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test', timezone }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to send test alert');
      }
      return res.json();
    },
    onSuccess: () => {
      setTestSent(true);
      setTestError(null);
      setTimeout(() => setTestSent(false), 5000);
    },
    onError: (err: Error) => {
      setTestError(err.message);
      setTimeout(() => setTestError(null), 5000);
    },
  });

  const togglePlatform = (id: string) => {
    setPlatforms((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const toggleLeadTime = (id: string) => {
    setLeadTimes((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const handleSave = () => {
    saveMutation.mutate({
      enabled,
      platforms,
      leadTimes,
      weeklyDigest,
      timezone,
    });
  };

  return (
    <div className="space-y-4 pt-1">
      {/* Main Grid: Landscape on desktop, Stacked on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Column (7 cols): Master switch, Platforms, and Sample Alert */}
        <div className="md:col-span-7 space-y-3.5 flex flex-col justify-between">
          {/* Master Switch */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-sunken border border-border/70">
            <div className="space-y-0.5 min-w-0 pr-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs sm:text-sm text-text">Contest Email Alerts</span>
                {enabled ? (
                  <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 text-[10px] py-0 px-1.5 font-mono font-semibold">
                    ACTIVE
                  </Badge>
                ) : (
                  <Badge className="bg-zinc-500/15 text-zinc-400 border-zinc-500/30 text-[10px] py-0 px-1.5 font-mono">
                    PAUSED
                  </Badge>
                )}
              </div>
              <Text size="caption" tone="muted" className="text-[11px] truncate block">
                Destination: <strong>{initialData.email}</strong>
              </Text>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          {/* Platforms Grid */}
          <div className={enabled ? 'space-y-2' : 'opacity-40 pointer-events-none space-y-2'}>
            <div className="flex items-center justify-between">
              <span className="text-2xs font-bold uppercase tracking-wider text-text-subtle">
                1. Select Platforms ({platforms.length} Active)
              </span>
              <button
                type="button"
                onClick={() =>
                  setPlatforms(
                    platforms.length === ALL_PLATFORMS.length
                      ? []
                      : ALL_PLATFORMS.map((p) => p.id)
                  )
                }
                className="text-[11px] text-primary hover:underline font-medium"
              >
                {platforms.length === ALL_PLATFORMS.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {ALL_PLATFORMS.map((plat) => {
                const isSelected = platforms.includes(plat.id);
                return (
                  <button
                    key={plat.id}
                    type="button"
                    onClick={() => togglePlatform(plat.id)}
                    className={`flex flex-col justify-between p-2.5 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-primary/10 border-primary/50 text-text ring-1 ring-primary/25 shadow-xs'
                        : 'bg-surface border-border/60 text-text-muted hover:border-border hover:bg-surface-sunken/40'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-semibold text-text truncate">{plat.label}</span>
                      {isSelected && <Check className="size-3 text-primary shrink-0" />}
                    </div>
                    <span className="text-[10px] text-text-muted line-clamp-1">{plat.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Admin-only Test Alert Email Trigger */}
          {initialData.isAdmin && (
            <div
              className={`rounded-xl border border-dashed border-primary/30 p-2.5 bg-primary/5 flex items-center justify-between gap-2 ${
                !enabled ? 'opacity-40 pointer-events-none' : ''
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-text flex items-center gap-1">
                    <Mail className="size-3.5 text-primary shrink-0" />
                    <span>Send Sample Alert</span>
                  </span>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] py-0 px-1 font-mono">
                    <Shield className="size-2.5 mr-0.5" /> ADMIN ONLY
                  </Badge>
                </div>
                <span className="text-[10px] text-text-muted block truncate mt-0.5">
                  Verify real email delivery to {initialData.email}
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => testMutation.mutate()}
                disabled={testMutation.isPending || !enabled}
                className="shrink-0 text-xs gap-1.5 h-7 px-2.5 font-medium border-primary/30 hover:bg-primary/10"
              >
                {testMutation.isPending ? (
                  <>
                    <Loader2 className="size-3 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : testSent ? (
                  <>
                    <CheckCircle2 className="size-3 text-emerald-500" />
                    <span className="text-emerald-500">Sent! Check Inbox</span>
                  </>
                ) : (
                  <>
                    <Send className="size-3" />
                    <span>Send Test</span>
                  </>
                )}
              </Button>
            </div>
          )}

          {testError && (
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
              {testError}
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Lead Times, Digest, Timezone, and Actions */}
        <div
          className={`md:col-span-5 space-y-3 flex flex-col justify-between md:border-l md:border-border/60 md:pl-4 ${
            !enabled ? 'opacity-40 pointer-events-none' : ''
          }`}
        >
          {/* Lead Times */}
          <div className="space-y-2">
            <span className="text-2xs font-bold uppercase tracking-wider text-text-subtle block">
              2. Reminder Lead Times
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-1.5">
              {LEAD_TIMES.map((lt) => {
                const isSelected = leadTimes.includes(lt.id);
                return (
                  <button
                    key={lt.id}
                    type="button"
                    onClick={() => toggleLeadTime(lt.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-primary/10 border-primary/50 text-text ring-1 ring-primary/25 shadow-xs'
                        : 'bg-surface border-border/60 text-text-muted hover:border-border hover:bg-surface-sunken/40'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-semibold text-text block">{lt.label}</span>
                      <span className="text-[10px] text-text-muted block">{lt.desc}</span>
                    </div>
                    {isSelected && <Check className="size-3.5 text-primary shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weekly Digest Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-surface">
            <div className="space-y-0.5 pr-2">
              <span className="text-xs font-semibold text-text block">Weekly Monday Digest</span>
              <span className="text-[10px] text-text-muted block leading-tight">
                Full week&apos;s schedule in one email
              </span>
            </div>
            <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
          </div>

          {/* Timezone Selector */}
          <div className="p-2.5 rounded-xl border border-border/60 bg-surface flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Globe className="size-3.5 text-text-muted shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-semibold text-text block leading-none">Timezone</span>
                <span className="text-[10px] text-text-muted block truncate mt-0.5">
                  {timezone}
                </span>
              </div>
            </div>
            <input
              type="text"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="e.g. Asia/Kolkata"
              className="text-xs px-2 py-1 rounded-md border border-border/60 bg-surface-sunken font-mono text-text w-[120px] text-right"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60 mt-auto">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} className="text-xs h-8">
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 px-3"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="size-3.5" />
                  <span>Save Preferences</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContestAlertPreferencesModal({
  trigger,
  open,
  onOpenChange,
}: {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange! : setInternalOpen;

  const { data, isLoading } = useQuery<{ subscription: SubscriptionData }>({
    queryKey: ['contestSubscription'],
    queryFn: async () => {
      const res = await fetch('/api/contests/subscription');
      if (!res.ok) throw new Error('Failed to load alert preferences');
      return res.json();
    },
    enabled: isOpen,
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger ? (
        <DialogTrigger render={trigger as any} />
      ) : (
        <DialogTrigger
          render={
            <Button variant="outline" className="gap-2 font-medium">
              <Bell className="size-4 text-primary" />
              <span>Contest Alerts</span>
            </Button>
          }
        />
      )}

      <DialogContent className="w-full max-w-full sm:max-w-xl md:max-w-4xl max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible p-5 sm:p-6">
        <DialogHeader className="pb-1 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
              <BellRing className="size-3.5" />
              <span>Contest Notification Center</span>
            </div>
          </div>
          <DialogTitle className="text-lg sm:text-xl font-bold">Email Alert Preferences</DialogTitle>
          <DialogDescription className="text-xs text-text-muted">
            Configure platforms, reminder lead times, and weekly digest for your contest alerts.
          </DialogDescription>
        </DialogHeader>

        {isLoading || !data ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="size-6 animate-spin text-primary" />
            <Text size="caption" tone="muted">
              Loading preferences...
            </Text>
          </div>
        ) : (
          <PreferencesForm
            initialData={data.subscription}
            onClose={() => setIsOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
