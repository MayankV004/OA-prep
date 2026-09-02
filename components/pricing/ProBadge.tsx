'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface ProBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProBadge({ size = 'sm', className = '' }: ProBadgeProps) {
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-0.5 gap-1.5',
    lg: 'text-sm px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-yellow-500/20 text-amber-500 border border-amber-500/30 dark:border-amber-400/30 dark:text-amber-400 shadow-sm ${sizeClasses[size]} ${className}`}
    >
      <Sparkles className="w-3 h-3 text-amber-500 dark:text-amber-400 fill-amber-500/30 animate-pulse" />
      <span>PRO</span>
    </span>
  );
}
