'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle2, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { FormBanner } from '@/components/auth/AuthField';
import { authContainerVariants, authItemVariants, motionTheme } from '@/lib/motion-theme';
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

      try {
        await authClient.getSession();
      } catch (e) {
        console.error('Session refresh error:', e);
      }

      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 900);
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
    <motion.div
      variants={authContainerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Icon & Title Header */}
      <motion.div variants={authItemVariants} className="space-y-3 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={motionTheme.transitions.lively}
          className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/10"
        >
          <Mail className="size-7" />
        </motion.div>
        <div className="space-y-1">
          <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Verify your email
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {isUnverifiedLogin ? (
              <span>Enter the 6-digit code sent to <strong className="text-foreground font-semibold">{email}</strong></span>
            ) : (
              <span>We sent a 6-digit verification code to <strong className="text-foreground font-semibold">{email || 'your email'}</strong></span>
            )}
          </p>
        </div>
      </motion.div>

      {error ? (
        <motion.div variants={authItemVariants}>
          <FormBanner tone="error">{error}</FormBanner>
        </motion.div>
      ) : null}

      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={motionTheme.transitions.gentle}
            className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-7 text-center space-y-2.5 backdrop-blur-md shadow-xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={motionTheme.transitions.lively}
            >
              <CheckCircle2 className="size-12 text-emerald-500 mx-auto" />
            </motion.div>
            <h3 className="font-display text-xl font-bold text-emerald-600 dark:text-emerald-400">
              Email Verified Successfully!
            </h3>
            <p className="text-xs text-muted-foreground">
              Launching your candidate cockpit...
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            variants={authItemVariants}
            onSubmit={(e) => {
              e.preventDefault();
              verifyCode(otp.join(''));
            }}
            className="space-y-6"
          >
            {/* 6-Digit OTP Box Grid with Motion Focus */}
            <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  disabled={loading || success}
                  className="size-12 sm:size-14 rounded-2xl border border-border/80 dark:border-white/10 bg-background/80 dark:bg-black/40 text-center font-mono text-xl sm:text-2xl font-bold text-foreground outline-none transition-all duration-150 focus:border-primary focus:ring-4 focus:ring-primary/15 focus:scale-105 disabled:opacity-50"
                />
              ))}
            </div>

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                size="lg"
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                loading={loading}
                disabled={otp.some((d) => !d) || loading}
              >
                Verify & Enter Cockpit
              </Button>
            </motion.div>

            {/* Resend Code Action */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <Link
                href="/sign-in"
                className="group inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back to sign in</span>
              </Link>

              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || resending}
                className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed cursor-pointer"
              >
                {resending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" /> Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  <span className="font-mono text-[11px] text-muted-foreground">
                    Resend in {resendCooldown}s
                  </span>
                ) : (
                  <>
                    <RefreshCw className="size-3.5" /> Resend code
                  </>
                )}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="grid place-items-center p-12">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
