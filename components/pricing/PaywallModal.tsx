'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureTitle?: string;
  featureDescription?: string;
}

export function PaywallModal({
  open,
  onOpenChange,
  featureTitle = 'This feature requires BigO Pro',
  featureDescription = 'Unlock unlimited company mock assessments, AI edge-case debugging, and recent placement questions.',
}: PaywallModalProps) {
  const perks = [
    'Real-world timed OA simulator with proctoring emulation',
    'AI debugger: Discover the exact failing inputs for your code',
    'Verified OA question bank from top tech companies (last 60 days)',
    'Full System Design, DevOps, and Advanced CS curriculum',
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-6 border-amber-500/20 bg-background/95 backdrop-blur-md">
        <DialogHeader className="text-center sm:text-left">
          <div className="mx-auto sm:mx-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm">
            <Sparkles className="h-6 w-6" />
          </div>
          <DialogTitle className="mt-4 text-xl font-bold tracking-tight">
            {featureTitle}
          </DialogTitle>
          <DialogDescription className="mt-1.5 text-sm text-muted-foreground">
            {featureDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 rounded-xl border border-border/60 bg-muted/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            What you get with Pro:
          </p>
          <ul className="space-y-2.5">
            {perks.map((perk, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-foreground/90">
                <div className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </div>
                <span>{perk}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="sm:w-1/3"
          >
            Cancel
          </Button>
          <Button
            render={<Link href="/pricing" onClick={() => onOpenChange(false)} />}
            className="sm:w-2/3 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 font-semibold shadow-md"
          >
            <span>View Plans</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
