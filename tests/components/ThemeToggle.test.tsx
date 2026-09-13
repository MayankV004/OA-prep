import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ThemeToggle } from '@/components/ThemeToggle';

const mockSetTheme = vi.fn();

vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'dark',
    setTheme: mockSetTheme,
  }),
}));

describe('ThemeToggle Component (components/ThemeToggle.tsx)', () => {
  it('renders theme toggle trigger button', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /change theme/i });
    expect(button).toBeInTheDocument();
  });

  it('renders toggle theme sr-only description', () => {
    render(<ThemeToggle />);
    expect(screen.getByText('Toggle theme')).toBeInTheDocument();
  });
});
