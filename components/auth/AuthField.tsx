'use client';

import * as React from 'react';
import { AlertCircle, Check, Eye, EyeOff } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Labelled field with inline validation. State is conveyed by icon and text as
 * well as colour, so it does not rely on colour alone.
 */
function AuthField({
  id,
  label,
  error,
  valid,
  hint,
  className,
  ...props
}: React.ComponentProps<'input'> & {
  id: string;
  label: string;
  error?: string | null;
  valid?: boolean;
  hint?: string;
}) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>

      <div className="relative">
        <Input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn('h-11 pr-9', className)}
          {...props}
        />

        {error ? (
          <AlertCircle
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-destructive"
            aria-hidden
          />
        ) : valid ? (
          <Check
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-success"
            aria-hidden
          />
        ) : null}
      </div>

      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="flex items-start gap-1.5 text-xs text-destructive"
        >
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Password field with a visibility toggle that keeps its own label. */
function PasswordField({
  id,
  label,
  error,
  hint,
  className,
  ...props
}: React.ComponentProps<'input'> & {
  id: string;
  label: string;
  error?: string | null;
  hint?: string;
}) {
  const [visible, setVisible] = React.useState(false);
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>

      <div className="relative">
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn('h-11 pr-11', className)}
          {...props}
        />

        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="press absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-md text-text-muted outline-none hover:text-foreground"
        >
          {visible ? (
            <EyeOff className="size-4" aria-hidden />
          ) : (
            <Eye className="size-4" aria-hidden />
          )}
        </button>
      </div>

      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-xs text-destructive"
        >
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const LEVELS = [
  { label: 'Too short', tone: 'bg-destructive', text: 'text-destructive' },
  { label: 'Weak', tone: 'bg-destructive', text: 'text-destructive' },
  { label: 'Fair', tone: 'bg-warning', text: 'text-warning' },
  { label: 'Good', tone: 'bg-info', text: 'text-info' },
  { label: 'Strong', tone: 'bg-success', text: 'text-success' },
];

/** Rough strength heuristic — guidance for the user, not a security control. */
function scorePassword(password: string): number {
  if (!password) return 0;
  if (password.length < 8) return 1;

  let score = 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^\w\s]/.test(password)) score += 1;

  return Math.min(score, 4);
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const score = scorePassword(password);
  const level = LEVELS[score];

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1" aria-hidden>
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-200 ease-out-quart',
              step <= score ? level.tone : 'bg-muted'
            )}
          />
        ))}
      </div>
      <p aria-live="polite" className={cn('text-xs', level.text)}>
        Password strength: {level.label}
      </p>
    </div>
  );
}

/** Inline banner. Errors sit in the form flow rather than in an alert dialog. */
function FormBanner({
  tone = 'error',
  children,
}: {
  tone?: 'error' | 'success' | 'info';
  children: React.ReactNode;
}) {
  const styles = {
    error: 'bg-danger-muted text-destructive',
    success: 'bg-success-muted text-success',
    info: 'bg-info-muted text-info',
  }[tone];

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'animate-in-fade flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm',
        styles
      )}
    >
      {tone === 'error' ? (
        <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
      ) : (
        <Check className="mt-0.5 size-4 shrink-0" aria-hidden />
      )}
      <span className="min-w-0">{children}</span>
    </div>
  );
}

export { AuthField, PasswordField, PasswordStrength, FormBanner, scorePassword };
