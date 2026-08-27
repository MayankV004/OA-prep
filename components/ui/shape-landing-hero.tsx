'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  y = 15,
  gradient = 'from-primary/[0.15]',
  parallaxFactor = 1,
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  y?: number;
  gradient?: string;
  parallaxFactor?: number;
}) {
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 800], [0, 150 * parallaxFactor]);
  const smoothParallaxY = useSpring(parallaxY, { stiffness: 100, damping: 20 });
  const rotateParallax = useTransform(scrollY, [0, 800], [rotate, rotate + 25 * parallaxFactor]);

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      style={{
        y: smoothParallaxY,
        rotate: rotateParallax,
      }}
      className={cn('absolute pointer-events-none z-0', className)}
    >
      <motion.div
        animate={{
          y: [0, y, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={cn(
            'absolute inset-0 rounded-full',
            'bg-gradient-to-r to-transparent',
            gradient,
            'backdrop-blur-[3px] border border-foreground/[0.08]',
            'shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.05)]',
            'after:absolute after:inset-0 after:rounded-full',
            'after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15),transparent_70%)]'
          )}
        />
      </motion.div>
    </motion.div>
  );
}

export function HeroGeometric({
  title1 = 'Master DSA & Systems.',
  title2 = 'Zero Distractions.',
  description = 'Empower your placement preparation with structured problem paths, interactive flashcards, AI guidance, and real-time execution.',
}: {
  title1?: string;
  title2?: string;
  description?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.92]);
  const heroY = useTransform(scrollYProgress, [0, 0.8], [0, 80]);

  const fadeUpVariants: any = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.2 + i * 0.15,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-[92vh] w-full flex items-center justify-center overflow-hidden bg-background pt-24 pb-16 transition-colors duration-500"
    >
      {/* Dynamic Ambient Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.08] via-transparent to-rose-500/[0.08] dark:from-red-500/[0.14] dark:to-rose-500/[0.14] blur-3xl pointer-events-none" />

      {/* Floating 3D Geometric Glassmorphic Shapes with Scroll Parallax */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          y={15}
          parallaxFactor={1.4}
          gradient="from-red-500/[0.2] dark:from-red-400/[0.25]"
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
        />

        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          y={15}
          parallaxFactor={-1.2}
          gradient="from-rose-500/[0.2] dark:from-rose-400/[0.25]"
          className="right-[-5%] md:right-[0%] top-[65%] md:top-[70%]"
        />

        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          y={15}
          parallaxFactor={1.8}
          gradient="from-pink-500/[0.2] dark:from-pink-400/[0.25]"
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
        />

        <ElegantShape
          delay={0.6}
          width={200}
          height={60}
          rotate={20}
          y={15}
          parallaxFactor={-0.8}
          gradient="from-orange-500/[0.2] dark:from-orange-400/[0.25]"
          className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
        />

        <ElegantShape
          delay={0.7}
          width={150}
          height={40}
          rotate={-25}
          y={15}
          parallaxFactor={2.1}
          gradient="from-red-600/[0.2] dark:from-red-500/[0.25]"
          className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
        />
      </div>

      {/* Main Content with Scroll Transform */}
      <motion.div
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        className="relative z-10 container mx-auto px-4 md:px-6"
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* Heading (Badge removed completely) */}
          <motion.div custom={0} variants={fadeUpVariants} initial="hidden" animate="visible">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight leading-[1.1]">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-foreground via-foreground/90 to-foreground/60 dark:from-white dark:via-white/90 dark:to-white/60">
                {title1}
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-rose-500 to-red-500 dark:from-red-400 dark:via-rose-400 dark:to-red-300">
                {title2}
              </span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.div custom={1} variants={fadeUpVariants} initial="hidden" animate="visible">
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed font-light tracking-wide max-w-2xl mx-auto px-4">
              {description}
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            custom={2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/dsa">
              <button className="group relative inline-flex items-center justify-center h-12 px-8 rounded-2xl font-semibold text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-500 shadow-[0_0_30px_rgba(225,29,72,0.4)] hover:shadow-[0_0_40px_rgba(225,29,72,0.7)] transition-all duration-300 hover:scale-105 active:scale-95 border-0 cursor-pointer">
                <span>Start Practice</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
            <a href="#features">
              <button className="h-12 px-8 rounded-2xl font-medium text-foreground bg-foreground/[0.04] dark:bg-white/[0.06] hover:bg-foreground/[0.08] dark:hover:bg-white/[0.1] border border-foreground/[0.1] dark:border-white/[0.15] backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer">
                Explore Features
              </button>
            </a>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom Gradient Fade */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}
