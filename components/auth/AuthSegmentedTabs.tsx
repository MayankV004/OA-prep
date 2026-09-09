'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { motionTheme } from '@/lib/motion-theme';

export function AuthSegmentedTabs() {
  const pathname = usePathname();
  const isSignUp = pathname === '/sign-up';

  return (
    <div className="flex justify-center mb-8">
      <div className="inline-flex p-1 rounded-full bg-[#18181B] border border-white/10 relative items-center shadow-inner">
        {/* Sign In Tab */}
        <Link
          href="/sign-in"
          className={`relative z-10 px-6 py-2 text-xs sm:text-sm font-semibold rounded-full transition-colors duration-200 outline-none select-none ${
            !isSignUp ? 'text-black' : 'text-zinc-400 hover:text-white'
          }`}
        >
          {!isSignUp && (
            <motion.div
              layoutId="auth-active-pill"
              transition={motionTheme.transitions.snap}
              className="absolute inset-0 rounded-full bg-emerald-400 shadow-sm -z-10"
            />
          )}
          <span>Sign In</span>
        </Link>

        {/* Create Account Tab */}
        <Link
          href="/sign-up"
          className={`relative z-10 px-6 py-2 text-xs sm:text-sm font-semibold rounded-full transition-colors duration-200 outline-none select-none ${
            isSignUp ? 'text-black' : 'text-zinc-400 hover:text-white'
          }`}
        >
          {isSignUp && (
            <motion.div
              layoutId="auth-active-pill"
              transition={motionTheme.transitions.snap}
              className="absolute inset-0 rounded-full bg-emerald-400 shadow-sm -z-10"
            />
          )}
          <span>Create Account</span>
        </Link>
      </div>
    </div>
  );
}

