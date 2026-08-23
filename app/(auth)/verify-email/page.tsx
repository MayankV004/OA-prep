'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, CheckCircle2, Loader2, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Heading, Text } from '@/components/ui/typography';
import { FormBanner } from '@/components/auth/AuthField';
import { useToast } from '@/components/ui/toast';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const email = searchParams.get('email') || '';
  const isUnverifiedLogin = searchParams.get('unverified') === 'true';

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 60-second countdown timer for Resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    // Handle multi-character paste into a single box
    if (value.length > 1) {
      const digits = value.slice(0, 6).split('');
      for (let i = 0; i < digits.length; i++) {
        newOtp[i] = digits[i];
      }
      setOtp(newOtp);
      const nextIndex = Math.min(digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      if (digits.length === 6) {
        verifyCode(digits.join(''));
      }
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are filled
    if (newOtp.every((d) => d !== '') && value !== '') {
      verifyCode(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pastedData)) {
      setError('Please paste a valid 6-digit numeric code');
      return;
    }
    const digits = pastedData.split('');
    setOtp(digits);
    inputRefs.current[5]?.focus();
    verifyCode(pastedData);
  };

  const verifyCode = async (codeToVerify: string) => {
    if (!email) {
      setError('Missing email address. Please sign up or log in again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: codeToVerify }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || 'Verification failed. Please try again.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      toast.add('Email Verified!', {
        description: 'Your account is now verified. Redirecting to your dashboard...',
        type: 'success',
      });

      // Refresh session programmatically and navigate immediately
      try {
        await authClient.getSession();
      } catch (e) {
        console.error('Session refresh error:', e);
      }

      window.location.href = '/dashboard';
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending || !email) return;

    setResending(true);
    setError('');

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || 'Failed to resend code.');
        setResending(false);
        return;
      }

      toast.add('Verification Code Sent', {
        description: `A fresh code has been sent to ${email}.`,
        type: 'info',
      });

      setResendCooldown(60);
      setOtp(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError('Could not resend verification code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="animate-in-up space-y-6">
      <div className="space-y-2 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-e1">
          <Mail className="size-7" />
        </div>
        <Heading level="page">Verify your email address</Heading>
        <Text size="compact" tone="muted" className="max-w-sm mx-auto">
          {isUnverifiedLogin ? (
            <span>Please enter the verification code sent to <strong>{email}</strong> to sign in.</span>
          ) : (
            <span>We sent a 6-digit verification code to <strong>{email || 'your email'}</strong>.</span>
          )}
        </Text>
      </div>

      {error ? <FormBanner tone="error">{error}</FormBanner> : null}

      {success ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-2 animate-in-up">
          <CheckCircle2 className="size-10 text-emerald-500 mx-auto" />
          <Heading level="section" className="text-emerald-600 dark:text-emerald-400 font-bold">
            Email Verified!
          </Heading>
          <Text size="compact" tone="muted">
            Redirecting you to the dashboard...
          </Text>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); verifyCode(otp.join('')); }} className="space-y-6">
          {/* 6-Digit OTP Box Grid */}
          <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                disabled={loading || success}
                className="size-12 sm:size-14 rounded-xl border border-border/80 bg-input-background text-center font-mono text-xl sm:text-2xl font-bold text-foreground outline-none transition-all focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 disabled:opacity-50"
              />
            ))}
          </div>

          <Button
            type="submit"
            size="xl"
            className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-500 text-white font-semibold shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:shadow-[0_0_25px_rgba(225,29,72,0.6)]"
            loading={loading}
            disabled={otp.some((d) => !d) || loading}
          >
            Verify Email
          </Button>

          {/* Resend Code Action */}
          <div className="flex items-center justify-between pt-2 text-xs">
            <Link href="/sign-in" className="inline-flex items-center gap-1.5 text-text-muted hover:text-foreground">
              <ArrowLeft className="size-3.5" /> Back to sign in
            </Link>

            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || resending}
              className="inline-flex items-center gap-1.5 font-medium text-rose-600 dark:text-rose-400 hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
            >
              {resending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" /> Sending...
                </>
              ) : resendCooldown > 0 ? (
                `Resend code in ${resendCooldown}s`
              ) : (
                <>
                  <RefreshCw className="size-3.5" /> Resend code
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="grid place-items-center p-12">
        <Loader2 className="size-8 animate-spin text-rose-500" />
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}
