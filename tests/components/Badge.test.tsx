import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from '@/components/ui/badge';

describe('Badge Component (components/ui/badge.tsx)', () => {
  it('renders badge with default variant', () => {
    render(<Badge>Default Badge</Badge>);
    const badge = screen.getByText('Default Badge');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-primary');
  });

  it('renders secondary variant correctly', () => {
    render(<Badge variant="secondary">Secondary Badge</Badge>);
    const badge = screen.getByText('Secondary Badge');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-secondary');
  });

  it('renders destructive variant with proper error styling', () => {
    render(<Badge variant="destructive">Error Badge</Badge>);
    const badge = screen.getByText('Error Badge');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('text-destructive');
  });

  it('applies custom className alongside variant styles', () => {
    render(<Badge className="font-mono custom-badge">Custom Class</Badge>);
    const badge = screen.getByText('Custom Class');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('custom-badge');
    expect(badge.className).toContain('font-mono');
  });
});
