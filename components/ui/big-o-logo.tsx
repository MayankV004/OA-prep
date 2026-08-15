'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface BigOLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  iconOnly?: boolean;
  showBadge?: boolean;
}

export function BigOIcon({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative grid place-items-center rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white shadow-[0_0_20px_rgba(225,29,72,0.4)] group-hover:scale-105 transition-transform duration-300',
        className
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="size-5 text-white stroke-[2.5]"
      >
        {/* Outer Big O Circle with asymptotic gap */}
        <circle
          cx="12"
          cy="12"
          r="8"
          stroke="currentColor"
          strokeDasharray="40 8"
          strokeLinecap="round"
        />
        {/* Inner dynamic infinity / speed pulse */}
        <path
          d="M8.5 12C8.5 10.5 10 9.5 12 9.5C14 9.5 15.5 11 15.5 12.5C15.5 14 14 15 12 15C10 15 8.5 13.5 8.5 12Z"
          fill="currentColor"
          fillOpacity="0.3"
        />
        {/* Central asymptotic core dot */}
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
    </div>
  );
}

export function BigOLogo({
  size = 'md',
  iconOnly = false,
  showBadge = false,
  className,
  ...props
}: BigOLogoProps) {
  const iconSizes = {
    sm: 'size-7',
    md: 'size-9',
    lg: 'size-11',
    xl: 'size-14',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  return (
    <div className={cn('inline-flex items-center gap-2.5 group select-none', className)} {...props}>
      <BigOIcon className={iconSizes[size]} />

      {!iconOnly && (
        <div className="flex items-center gap-1.5 leading-none">
          <span className={cn('font-display font-black tracking-tight text-foreground', textSizes[size])}>
            Big<span className="text-rose-500 font-extrabold">O</span>
          </span>

          {showBadge && (
            <span className="px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-500 font-mono text-[10px] font-bold border border-rose-500/20">
              O(1)
            </span>
          )}
        </div>
      )}
    </div>
  );
}
