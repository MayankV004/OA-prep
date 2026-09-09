'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  CreditCard,
  DollarSign,
  Plus,
  Save,
  Sparkles,
  Tags,
  Trash2,
  Undo2,
} from 'lucide-react';
import { PageHeading, Text } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { CheckoutPlanKey } from '@/lib/payments/types';

interface PricingPlanData {
  planKey: CheckoutPlanKey;
  name: string;
  badge?: string;
  priceUsd: number;
  period: 'month' | 'year' | '75_days';
  mode: 'subscription' | 'payment';
  description: string;
  features: string[];
  aiCredits: number;
  isActive: boolean;
}

export default function AdminPricingPage() {
  const queryClient = useQueryClient();
  const [plans, setPlans] = useState<Record<CheckoutPlanKey, PricingPlanData>>({
    pro_monthly: {
      planKey: 'pro_monthly',
      name: 'BigO Pro (Monthly)',
      badge: '',
      priceUsd: 14,
      period: 'month',
      mode: 'subscription',
      description: 'Billed monthly. Cancel anytime with 1 click.',
      features: [
        'Unlimited Company Mock OA Simulators',
        'Recent 60-day company question bank',
        'AI Edge-Case & Failing Input Debugger',
        '100 AI credits / month',
        'Full System Design & Advanced CS deep dives',
        'In-browser Monaco code execution',
      ],
      aiCredits: 100,
      isActive: true,
    },
    pro_annual: {
      planKey: 'pro_annual',
      name: 'BigO Pro (Annual)',
      badge: 'Save 47% — Best Value',
      priceUsd: 89,
      period: 'year',
      mode: 'subscription',
      description: 'Equivalent to $7.40/mo. Perfect for full year recruitment cycles.',
      features: [
        'Everything in Pro Monthly',
        'Save 47% over monthly billing',
        'Priority access to new company OA packs',
        '1,500 AI credits / year',
        'Full season interview revision & flashcards',
        'Exclusive placement prep webinars & community',
      ],
      aiCredits: 1500,
      isActive: true,
    },
    oa_pass: {
      planKey: 'oa_pass',
      name: 'OA Season Pass',
      badge: 'One-Time Purchase',
      priceUsd: 39,
      period: '75_days',
      mode: 'payment',
      description: '75 days of full Pro access for your campus placement drive. No recurring auto-charge.',
      features: [
        'Full Pro access for 75 days',
        'No subscription or recurring charges',
        '250 AI debugging credits',
        'Target company crash course packs',
        'Timed OA simulator & leaderboard analytics',
      ],
      aiCredits: 250,
      isActive: true,
    },
  });

  const { data, isLoading } = useQuery<{ data: PricingPlanData[] }>({
    queryKey: ['admin', 'pricing'],
    queryFn: async () => {
      const res = await fetch('/api/admin/pricing');
      if (!res.ok) throw new Error('Failed to fetch pricing plans');
      return res.json();
    },
  });

  useEffect(() => {
    if (data?.data && Array.isArray(data.data)) {
      const mapped: any = { ...plans };
      for (const p of data.data) {
        if (p.planKey && mapped[p.planKey]) {
          mapped[p.planKey] = {
            ...mapped[p.planKey],
            name: p.name,
            badge: p.badge || '',
            priceUsd: p.priceUsd,
            period: p.period,
            mode: p.mode,
            description: p.description || '',
            features: p.features || [],
            aiCredits: p.aiCredits || 100,
            isActive: p.isActive !== undefined ? p.isActive : true,
          };
        }
      }
      setPlans(mapped);
    }
  }, [data]);

  const savePlanMutation = useMutation({
    mutationFn: async (plan: PricingPlanData) => {
      const res = await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to update plan');
      return json;
    },
    onSuccess: (_, plan) => {
      toast.success(`Updated ${plan.name} pricing successfully`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'pricing'] });
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
    },
    onError: (err: any) => {
      toast.error('Failed to update plan', { description: err.message });
    },
  });

  const handleUpdateField = (
    key: CheckoutPlanKey,
    field: keyof PricingPlanData,
    value: any
  ) => {
    setPlans((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const handleAddFeature = (key: CheckoutPlanKey) => {
    setPlans((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        features: [...prev[key].features, 'New premium feature benefit'],
      },
    }));
  };

  const handleRemoveFeature = (key: CheckoutPlanKey, idx: number) => {
    setPlans((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        features: prev[key].features.filter((_, i) => i !== idx),
      },
    }));
  };

  const planKeys: CheckoutPlanKey[] = ['pro_monthly', 'pro_annual', 'oa_pass'];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/billing"
            className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="size-3.5 mr-1" />
            Back to Billing & Subscriptions
          </Link>
          <PageHeading
            title="Pricing & Plan Configuration"
            description="Control candidate-facing plan pricing, feature bullet lists, AI credit allocations, and seasonal badges."
          />
        </div>

        <Button
          onClick={() => {
            planKeys.forEach((k) => savePlanMutation.mutate(plans[k]));
          }}
          disabled={savePlanMutation.isPending}
          className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold h-10 px-6 rounded-xl shadow-xs"
        >
          <Save className="size-4 mr-2" />
          {savePlanMutation.isPending ? 'Saving All...' : 'Save All Plans'}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading pricing plan configurations...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {planKeys.map((key) => {
            const plan = plans[key];
            return (
              <Card key={key} className="rounded-2xl border-border/80 shadow-xs flex flex-col justify-between">
                <CardHeader className="pb-3 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                      {key}
                    </span>
                    <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-2xs">
                      {plan.mode}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold pt-1">{plan.name}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 pt-4">
                  {/* Price Setting */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold flex items-center gap-1">
                      <DollarSign className="size-3 text-emerald-500" />
                      Base Price (USD) *
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-sm text-muted-foreground font-mono">$</span>
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        className="pl-7 font-mono font-bold text-base"
                        value={plan.priceUsd}
                        onChange={(e) => handleUpdateField(key, 'priceUsd', Number(e.target.value))}
                        required
                      />
                    </div>
                  </div>

                  {/* Display Name */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Display Title</Label>
                    <Input
                      value={plan.name}
                      onChange={(e) => handleUpdateField(key, 'name', e.target.value)}
                      required
                    />
                  </div>

                  {/* Badge Text */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Callout Badge (Optional)</Label>
                    <Input
                      placeholder="e.g. Save 47% — Best Value"
                      value={plan.badge || ''}
                      onChange={(e) => handleUpdateField(key, 'badge', e.target.value)}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Subtitle Description</Label>
                    <Textarea
                      rows={2}
                      value={plan.description}
                      onChange={(e) => handleUpdateField(key, 'description', e.target.value)}
                    />
                  </div>

                  {/* AI Credits */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold flex items-center gap-1">
                      <Sparkles className="size-3 text-amber-500" />
                      AI Debugging Credits Allocation
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      value={plan.aiCredits}
                      onChange={(e) => handleUpdateField(key, 'aiCredits', Number(e.target.value))}
                    />
                  </div>

                  {/* Feature Bullets */}
                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold">Feature Bullets ({plan.features.length})</Label>
                      <button
                        type="button"
                        onClick={() => handleAddFeature(key)}
                        className="text-2xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <Plus className="size-3" /> Add Item
                      </button>
                    </div>

                    <div className="space-y-2">
                      {plan.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-1.5">
                          <Input
                            value={feat}
                            onChange={(e) => {
                              const nextFeats = [...plan.features];
                              nextFeats[fIdx] = e.target.value;
                              handleUpdateField(key, 'features', nextFeats);
                            }}
                            className="text-xs h-8"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(key, fIdx)}
                            className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => savePlanMutation.mutate(plan)}
                      disabled={savePlanMutation.isPending}
                      className="w-full text-xs font-semibold"
                    >
                      Save {plan.name}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
