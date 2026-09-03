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
      className={`inline-flex items-center font-bold rounded-full bg-warning/15 text-warning border border-warning/30 shadow-xs ${sizeClasses[size]} ${className}`}
    >
      <Sparkles className="w-3 h-3 text-warning fill-warning/30" />
      <span>PRO</span>
    </span>
  );
}
