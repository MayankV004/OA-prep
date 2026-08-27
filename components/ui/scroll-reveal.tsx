'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform, useSpring, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
  scale?: number;
  blur?: boolean;
}

export function ScrollReveal({
  children,
  className,
  direction = 'up',
  delay = 0,
  duration = 0.7,
  distance = 40,
  once = false,
  scale = 0.95,
  blur = true,
}: ScrollRevealProps) {
  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { y: distance, x: 0 };
      case 'down':
        return { y: -distance, x: 0 };
      case 'left':
        return { x: distance, y: 0 };
      case 'right':
        return { x: -distance, y: 0 };
      default:
        return { x: 0, y: 0 };
    }
  };

  const initialPos = getInitialPosition();

  const variants: Variants = {
    hidden: {
      opacity: 0,
      x: initialPos.x,
      y: initialPos.y,
      scale: scale,
      filter: blur ? 'blur(10px)' : 'blur(0px)',
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-60px' }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// --------------------------------------------------------
// Scroll-triggered Animated Count Up Stat Component
// --------------------------------------------------------
export function ScrollCountUp({
  value,
  label,
  className,
}: {
  value: string;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: '-50px' });
  const [displayValue, setDisplayValue] = useState('0');

  // Extract number and suffix (e.g., '90+' -> target: 90, suffix: '+')
  const numMatch = value.match(/(\d+)(.*)/);
  const targetNum = numMatch ? parseInt(numMatch[1], 10) : 0;
  const suffix = numMatch ? numMatch[2] : '';

  useEffect(() => {
    if (!isInView || targetNum === 0) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const duration = 1500; // ms
    const startTime = performance.now();

    const updateCount = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quad
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easedProgress * targetNum);

      setDisplayValue(`${current}${suffix}`);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        setDisplayValue(value);
      }
    };

    const animFrame = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(animFrame);
  }, [isInView, targetNum, suffix, value]);

  return (
    <div ref={ref} className={cn('text-center p-6 rounded-3xl relative group', className)}>
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-red-500/5 via-rose-500/5 to-red-600/5 group-hover:from-red-500/10 group-hover:to-rose-500/10 transition-colors duration-500 pointer-events-none" />
      <div className="text-4xl sm:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-rose-500 to-red-500 font-mono">
        {displayValue}
      </div>
      <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground mt-2">
        {label}
      </div>
    </div>
  );
}

// --------------------------------------------------------
// 3D Perspective Scroll Card
// --------------------------------------------------------
export function Scroll3DCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'center center'],
  });

  const rotateX = useTransform(scrollYProgress, [0, 1], [15, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.8, 1]);

  const smoothRotateX = useSpring(rotateX, { stiffness: 120, damping: 20 });
  const smoothScale = useSpring(scale, { stiffness: 120, damping: 20 });

  return (
    <div ref={cardRef} className="perspective-1000">
      <motion.div
        style={{
          rotateX: smoothRotateX,
          scale: smoothScale,
          opacity,
          transformStyle: 'preserve-3d',
        }}
        className={cn('transition-shadow duration-500', className)}
      >
        {children}
      </motion.div>
    </div>
  );
}
