'use client';

import React from 'react';

interface ProBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProBadge({ size = 'sm', className = '' }: ProBadgeProps) {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1',
  };

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full bg-warning/15 text-warning border border-warning/30 shadow-xs uppercase tracking-wider ${sizeClasses[size]} ${className}`}
    >
      PRO
    </span>
  );
}
