'use client';

import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { BigOLogo } from '@/components/ui/big-o-logo';
import { CheckCircle2 } from 'lucide-react';

export function AuthParallaxShowcase() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for fluid mouse parallax on ambient background glow
  const smoothX = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 80, damping: 20 });

  const bgOrbX = useTransform(smoothX, [-0.5, 0.5], [-50, 50]);
  const bgOrbY = useTransform(smoothY, [-0.5, 0.5], [-50, 50]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <aside
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative hidden overflow-hidden bg-[#070A0F] text-white lg:flex lg:flex-col justify-between p-12 xl:p-16 border-r border-white/10 select-none"
    >
      {/* ── Deep Background Grid & Subtle Ambient Glow ── */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Floating Ambient Glow shifting smoothly with cursor */}
      <motion.div
        style={{ x: bgOrbX, y: bgOrbY }}
        className="absolute top-1/3 left-1/4 size-[520px] rounded-full bg-gradient-to-br from-emerald-500/12 via-teal-500/8 to-transparent blur-3xl pointer-events-none"
      />

      {/* ── Top Bar ── */}
      <div className="relative z-10 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <BigOLogo size="lg" />
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md text-[11px] font-mono text-white/70">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Evaluation Engine v2.4</span>
        </div>
      </div>

      {/* ── Center: Clean, Breathable, Uncluttered Typography ── */}
      <div className="relative z-10 my-auto py-12 max-w-lg space-y-6">
        <div className="space-y-4">
          <h1 className="font-display text-4xl xl:text-5xl font-black tracking-tight text-white leading-[1.14]">
            Every Pattern. <br />
            Every Assessment. <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
              One Unified Cockpit.
            </span>
          </h1>
          <p className="text-white/60 text-base xl:text-lg leading-relaxed font-normal pt-2">
            The high-precision workspace for engineers targeting top-tier tech placements. Master 90+ algorithmic variations, simulate real OAs, and retain core CS theory.
          </p>
        </div>
      </div>

      {/* ── Bottom Strip ── */}
      <div className="relative z-10 flex items-center justify-between text-xs text-white/40 border-t border-white/10 pt-6">
        <span>BigO © {new Date().getFullYear()}</span>
        <span className="flex items-center gap-2 text-emerald-400/90 font-medium">
          <CheckCircle2 className="size-3.5" />
          <span>Over 1,200+ candidates preparing for placements</span>
        </span>
      </div>
    </aside>
  );
}
