'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Menu, X, LayoutDashboard, Terminal, ChevronRight, HelpCircle } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { UserMenu } from '@/components/shell/UserMenu';
import { AnimatedThemeToggle } from '@/components/ui/animated-theme-toggle';
import { BigOLogo } from '@/components/ui/big-o-logo';

export function Navbar() {
  const { data: session } = authClient.useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'DSA Patterns', href: '/dsa', icon: Code2 },
    { name: 'CS Core', href: '/subjects', icon: Terminal },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Contact Us', href: '/contact', icon: HelpCircle },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-3.5"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-2.5 rounded-2xl bg-background/70 dark:bg-background/60 backdrop-blur-xl border border-border/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <BigOLogo size="md" showBadge />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-foreground/[0.03] dark:bg-white/[0.04] p-1 rounded-xl border border-border/40">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="relative px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-background/80"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Action Controls: Animated Theme Switcher + Auth Buttons */}
        <div className="flex items-center gap-3">
          {/* Animated Theme Switcher Component from 21st.dev */}
          <AnimatedThemeToggle />

          {/* User Auth Session */}
          {session ? (
            <div className="w-10 h-10 flex items-center justify-center">
              <UserMenu collapsed={true} isAdmin={(session.user as { role?: string })?.role === 'admin'} />
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/sign-in">
                <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-accent/50">
                  Log In
                </button>
              </Link>
              <Link href="/sign-up">
                <button className="relative group overflow-hidden px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-500 shadow-[0_0_20px_rgba(225,29,72,0.35)] hover:shadow-[0_0_25px_rgba(225,29,72,0.6)] transition-all duration-300 hover:scale-105 active:scale-95 border-none">
                  <span className="relative z-10">Get Started</span>
                </button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-border/40 bg-background/50 text-foreground"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden mt-2 max-w-7xl mx-auto rounded-2xl bg-background/95 backdrop-blur-xl border border-border/50 p-4 shadow-2xl overflow-hidden"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/40 text-foreground font-medium transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-indigo-500" />
                      <span>{link.name}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                );
              })}

              {!session && (
                <div className="flex flex-col gap-2 pt-3 border-t border-border/40 mt-2">
                  <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full py-2.5 text-center font-medium text-foreground rounded-xl border border-border/50 bg-background hover:bg-accent/50">
                      Log In
                    </button>
                  </Link>
                  <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full py-2.5 text-center font-semibold text-white rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-500 shadow-md">
                      Get Started
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
