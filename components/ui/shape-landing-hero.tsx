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
  parallaxFactor = 1,
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  y?: number;
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
            'bg-card/40 dark:bg-card/25 backdrop-blur-[2px] border border-border/40',
            'shadow-[0_8px_32px_0_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]'
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
      className="relative min-h-[92vh] w-full flex items-center justify-center overflow-hidden bg-background aurora-mesh pt-24 pb-16 transition-colors duration-500"
    >
      {/* Floating 3D Geometric Glassmorphic Shapes with Scroll Parallax */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          y={15}
          parallaxFactor={1.4}
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
        />

        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          y={15}
          parallaxFactor={-1.2}
          className="right-[-5%] md:right-[0%] top-[65%] md:top-[70%]"
        />

        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          y={15}
          parallaxFactor={1.8}
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
        />

        <ElegantShape
          delay={0.6}
          width={200}
          height={60}
          rotate={20}
          y={15}
          parallaxFactor={-0.8}
          className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
        />

        <ElegantShape
          delay={0.7}
          width={150}
          height={40}
          rotate={-25}
          y={15}
          parallaxFactor={2.1}
          className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
        />
      </div>

      {/* Main Content with Scroll Transform */}
      <motion.div
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        className="relative z-10 container mx-auto px-4 md:px-6"
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* Elevated Flagship Typography */}
          <motion.div custom={0} variants={fadeUpVariants} initial="hidden" animate="visible">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[5.75rem] font-display font-black mb-6 tracking-[-0.035em] sm:tracking-[-0.045em] leading-[1.04]">
              <span className="bg-gradient-to-b from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent block">
                {title1}
              </span>
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-200 bg-clip-text text-transparent block mt-1.5 drop-shadow-xs">
                {title2}
              </span>
            </h1>
          </motion.div>

          {/* Subtitle with High Contrast & Readability */}
          <motion.div custom={1} variants={fadeUpVariants} initial="hidden" animate="visible">
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground/90 dark:text-muted-foreground mb-10 leading-relaxed font-normal max-w-2xl mx-auto px-4">
              {description}
            </p>
          </motion.div>

          {/* Emerald Theme CTA Buttons */}
          <motion.div
            custom={2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/dsa">
              <button className="group relative inline-flex items-center justify-center h-13 px-9 rounded-full font-bold text-black bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 border-t border-white/30 transition-all duration-200 active:scale-[0.98] cursor-pointer text-base">
                <span>Start Practice</span>
                <ArrowRight className="ml-2.5 size-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
            <a href="#features">
              <button className="inline-flex items-center justify-center h-13 px-8 rounded-full font-semibold text-foreground bg-background/80 dark:bg-white/[0.04] hover:bg-muted/70 dark:hover:bg-white/[0.08] border border-border/80 dark:border-white/10 backdrop-blur-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-base shadow-xs">
                Explore Features
              </button>
            </a>
          </motion.div>

          {/* Trust Metric Strip */}
          <motion.div
            custom={3}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium"
          >
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>90+ Algorithmic Patterns</span>
            </span>
            <span className="hidden sm:inline text-border">•</span>
            <span>Interactive Multi-Language Sandbox</span>
            <span className="hidden sm:inline text-border">•</span>
            <span>Tier-1 Placement OA Simulations</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom Gradient Fade */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}
