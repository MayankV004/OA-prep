'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

export function AnimatedThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? resolvedTheme || theme : 'dark';
  const isDark = currentTheme === 'dark';

  const toggleThemeWithRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const nextTheme = isDark ? 'light' : 'dark';

    // Fallback if View Transitions API is not supported in browser
    if (typeof document === 'undefined' || !(document as any).startViewTransition) {
      setTheme(nextTheme);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX || rect.left + rect.width / 2;
    const y = event.clientY || rect.top + rect.height / 2;

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = (document as any).startViewTransition(() => {
      setTheme(nextTheme);
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 550,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  };

  if (!mounted) {
    return (
      <div
        className={cn(
          'relative flex h-10 w-10 items-center justify-center rounded-xl border border-border/40 bg-background/50 backdrop-blur-md',
          className
        )}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleThemeWithRipple}
      aria-label="Toggle color theme"
      className={cn(
        'group relative flex h-10 w-10 items-center justify-center rounded-xl border border-border/40 bg-background/60 backdrop-blur-xl shadow-sm transition-all hover:scale-105 hover:border-rose-500/50 hover:bg-accent/40 active:scale-95 focus:outline-none shrink-0',
        className
      )}
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-rose-500/10 via-transparent to-red-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <SolarSwitch isDark={isDark} />
    </button>
  );
}

const SolarSwitch = ({ isDark }: { isDark: boolean }) => {
  const duration = 0.5;

  const moonVariants: any = {
    checked: { scale: 1, rotate: 0 },
    unchecked: { scale: 0, rotate: -90 },
  };

  const sunVariants: any = {
    checked: { scale: 0, rotate: 90 },
    unchecked: { scale: 1, rotate: 0 },
  };

  const scaleMoon = useMotionValue(isDark ? 1 : 0);
  const scaleSun = useMotionValue(isDark ? 0 : 1);
  const pathLengthMoon = useTransform(scaleMoon, [0.6, 1], [0, 1]);
  const pathLengthSun = useTransform(scaleSun, [0.6, 1], [0, 1]);

  return (
    <motion.div animate={isDark ? 'checked' : 'unchecked'} className="relative flex items-center justify-center pointer-events-none">
      <motion.svg
        width="20"
        height="20"
        viewBox="0 0 25 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-foreground transition-colors"
      >
        {/* Sun Core & Rays */}
        <motion.path
          d="M12.4058 17.7625C15.1672 17.7625 17.4058 15.5239 17.4058 12.7625C17.4058 10.0011 15.1672 7.76251 12.4058 7.76251C9.64434 7.76251 7.40576 10.0011 7.40576 12.7625C7.40576 15.5239 9.64434 17.7625 12.4058 17.7625Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={sunVariants}
          custom={isDark}
          transition={{ duration, ease: 'easeInOut' }}
          style={{
            pathLength: pathLengthSun,
            scale: scaleSun,
          }}
        />
        <motion.path
          d="M12.4058 1.76251V3.76251"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={sunVariants}
          custom={isDark}
          transition={{ duration }}
          style={{ pathLength: pathLengthSun, scale: scaleSun }}
        />
        <motion.path
          d="M12.4058 21.7625V23.7625"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={sunVariants}
          custom={isDark}
          transition={{ duration }}
          style={{ pathLength: pathLengthSun, scale: scaleSun }}
        />
        <motion.path
          d="M4.62598 4.98248L6.04598 6.40248"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={sunVariants}
          custom={isDark}
          transition={{ duration }}
          style={{ pathLength: pathLengthSun, scale: scaleSun }}
        />
        <motion.path
          d="M18.7656 19.1225L20.1856 20.5425"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={sunVariants}
          custom={isDark}
          transition={{ duration }}
          style={{ pathLength: pathLengthSun, scale: scaleSun }}
        />
        <motion.path
          d="M1.40576 12.7625H3.40576"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={sunVariants}
          custom={isDark}
          transition={{ duration }}
          style={{ pathLength: pathLengthSun, scale: scaleSun }}
        />
        <motion.path
          d="M21.4058 12.7625H23.4058"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={sunVariants}
          custom={isDark}
          transition={{ duration }}
          style={{ pathLength: pathLengthSun, scale: scaleSun }}
        />
        <motion.path
          d="M4.62598 20.5425L6.04598 19.1225"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={sunVariants}
          custom={isDark}
          transition={{ duration }}
          style={{ pathLength: pathLengthSun, scale: scaleSun }}
        />
        <motion.path
          d="M18.7656 6.40248L20.1856 4.98248"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={sunVariants}
          custom={isDark}
          transition={{ duration }}
          style={{ pathLength: pathLengthSun, scale: scaleSun }}
        />

        {/* Moon */}
        <motion.path
          d="M21.1918 13.2013C21.0345 14.9035 20.3957 16.5257 19.35 17.8781C18.3044 19.2305 16.8953 20.2571 15.2875 20.8379C13.6797 21.4186 11.9398 21.5294 10.2713 21.1574C8.60281 20.7854 7.07479 19.9459 5.86602 18.7371C4.65725 17.5283 3.81774 16.0003 3.4457 14.3318C3.07367 12.6633 3.18451 10.9234 3.76526 9.31561C4.346 7.70783 5.37263 6.29868 6.72501 5.25307C8.07739 4.20746 9.69959 3.56862 11.4018 3.41132C10.4052 4.75958 9.92564 6.42077 10.0503 8.09273C10.175 9.76469 10.8957 11.3364 12.0812 12.5219C13.2667 13.7075 14.8384 14.4281 16.5104 14.5528C18.1823 14.6775 19.8435 14.1979 21.1918 13.2013Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          transition={{ duration, ease: 'easeInOut' }}
          variants={moonVariants}
          custom={isDark}
          style={{
            pathLength: pathLengthMoon,
            scale: scaleMoon,
          }}
        />
      </motion.svg>
    </motion.div>
  );
};
