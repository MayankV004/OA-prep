'use client';

import { useState } from 'react';
import { Info, Megaphone, Palette, ToggleLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { Heading, PageHeading, Text } from '@/components/ui/typography';

/**
 * Site-wide settings.
 *
 * TODO: backend — there is no settings endpoint or model. Every control here is
 * local state only; nothing persists across a reload. Wiring needed:
 *   GET  /api/admin/settings        → load the values below
 *   PATCH /api/admin/settings       → save a partial update
 * The shapes in DEFAULTS mirror what the UI expects.
 */

const DEFAULTS = {
  siteName: 'BigO',
  tagline: 'Master DSA Patterns & Core CS',
  supportEmail: '',
  announcementEnabled: false,
  announcementTone: 'info',
  announcementMessage: '',
  signupsOpen: true,
  inviteOnly: true,
  studioLinkVisible: true,
  exportEnabled: true,
};

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl bg-card p-5 shadow-e2">
      <div className="space-y-1">
        <Heading level="card" as="h3">
          {title}
        </Heading>
        {description ? (
          <Text size="caption" tone="muted">
            {description}
          </Text>
        ) : null}
      </div>
      <Separator className="my-4" />
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const id = label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 space-y-0.5">
        <Label htmlFor={id}>{label}</Label>
        <Text size="caption" tone="muted">
          {description}
        </Text>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export default function AdminSettingsPage() {
  const toast = useToast();
  const [values, setValues] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof typeof DEFAULTS>(
    key: K,
    value: (typeof DEFAULTS)[K]
  ) => setValues((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    // TODO: backend — replace with PATCH /api/admin/settings
    await new Promise((resolve) => setTimeout(resolve, 400));
    setSaving(false);
    toast.add('Settings are not persisted yet', {
      description: 'The save endpoint still needs to be built.',
      type: 'error',
    });
  };

  return (
    <>
      <PageHeading
        overline="System"
        title="Settings"
        description="Site-wide configuration for branding, access and announcements."
        actions={
          <Button loading={saving} onClick={handleSave}>
            Save changes
          </Button>
        }
      />

      <div className="flex items-start gap-2.5 rounded-lg bg-info-muted px-3.5 py-3">
        <Info className="mt-0.5 size-4 shrink-0 text-info" aria-hidden />
        <Text size="caption" className="text-info">
          These controls are interface only — no settings endpoint exists yet, so
          changes are lost on reload. The backend TODO is documented at the top of
          this file.
        </Text>
      </div>

      <Tabs defaultValue={0}>
        <TabsList>
          <TabsTab value={0}>
            <Palette />
            Branding
          </TabsTab>
          <TabsTab value={1}>
            <ToggleLeft />
            Features
          </TabsTab>
          <TabsTab value={2}>
            <Megaphone />
            Announcement
          </TabsTab>
        </TabsList>

        <TabsPanel value={0}>
          <SettingsSection
            title="Identity"
            description="How the product names itself across the app and in emails."
          >
            <div className="space-y-1.5">
              <Label htmlFor="siteName">Site name</Label>
              <Input
                id="siteName"
                value={values.siteName}
                onChange={(e) => set('siteName', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={values.tagline}
                onChange={(e) => set('tagline', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="supportEmail">Support email</Label>
              <Input
                id="supportEmail"
                type="email"
                placeholder="support@example.com"
                value={values.supportEmail}
                onChange={(e) => set('supportEmail', e.target.value)}
              />
              <Text size="caption" tone="muted">
                Shown to users when something goes wrong.
              </Text>
            </div>
          </SettingsSection>
        </TabsPanel>

        <TabsPanel value={1}>
          <SettingsSection
            title="Access"
            description="Who can create an account and how."
          >
            <ToggleRow
              label="Signups open"
              description="Allow anyone to create an account from the sign-up page."
              checked={values.signupsOpen}
              onCheckedChange={(v) => set('signupsOpen', v)}
            />
            <Separator />
            <ToggleRow
              label="Invite only"
              description="Restrict new accounts to people holding an invite token."
              checked={values.inviteOnly}
              onCheckedChange={(v) => set('inviteOnly', v)}
            />
          </SettingsSection>

          <SettingsSection
            title="Feature flags"
            description="Turn parts of the product on or off without a deploy."
          >
            <ToggleRow
              label="Studio link"
              description="Surface the Sanity Studio link in admin navigation."
              checked={values.studioLinkVisible}
              onCheckedChange={(v) => set('studioLinkVisible', v)}
            />
            <Separator />
            <ToggleRow
              label="Data export"
              description="Let users download their progress from the account menu."
              checked={values.exportEnabled}
              onCheckedChange={(v) => set('exportEnabled', v)}
            />
          </SettingsSection>
        </TabsPanel>

        <TabsPanel value={2}>
          <SettingsSection
            title="Announcement banner"
            description="A short message shown at the top of every page."
          >
            <ToggleRow
              label="Show banner"
              description="Display the announcement to all signed-in users."
              checked={values.announcementEnabled}
              onCheckedChange={(v) => set('announcementEnabled', v)}
            />

            <Separator />

            <div className="space-y-1.5">
              <Label htmlFor="announcementMessage">Message</Label>
              <Textarea
                id="announcementMessage"
                rows={3}
                placeholder="Scheduled maintenance this Sunday from 2am."
                value={values.announcementMessage}
                onChange={(e) => set('announcementMessage', e.target.value)}
              />
              <Text size="caption" tone="muted">
                Keep it to one sentence — the banner is a single line on mobile.
              </Text>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="announcementTone">Tone</Label>
              <select
                id="announcementTone"
                value={values.announcementTone}
                onChange={(e) => set('announcementTone', e.target.value)}
                className="h-9 w-full rounded-lg bg-input-background px-3 text-sm text-foreground outline-none transition-shadow focus-visible:bg-surface focus-visible:shadow-glow"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
              </select>
            </div>
          </SettingsSection>
        </TabsPanel>
      </Tabs>
    </>
  );
}
