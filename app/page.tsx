'use client';

import { motion, useScroll, useTransform, useInView, Variants } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { Code2, Server, BrainCircuit, BookOpen, ChevronRight, LayoutDashboard } from 'lucide-react';

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });

  // Parallax effects
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, 400]);

  // Progress circle
  const progressRef = useRef(null);
  const isProgressInView = useInView(progressRef, { once: false, margin: "-100px" });

  return (
    <div ref={containerRef} className="min-h-screen bg-background text-foreground font-sans overflow-hidden selection:bg-primary/30">

      {/* 1. Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 bg-background/60 backdrop-blur-xl border-none"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-accent-300 shadow-[0_0_20px_rgba(236,72,153,0.4)]">
            <Code2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">PlacementDeck</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#editor" className="hover:text-foreground transition-colors">Editor</a>
          <a href="#progress" className="hover:text-foreground transition-colors">Progress</a>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Log In
          </Link>
          <Link href="/sign-up">
            <button className="h-10 px-6 rounded-full font-bold text-white bg-gradient-to-r from-accent-600 via-accent-500 to-accent-400 hover:shadow-[0_0_25px_rgba(236,72,153,0.6)] transition-all hover:scale-105 active:scale-95 border-none">
              Get Started
            </button>
          </Link>
        </div>
      </motion.nav>

      {/* 2. Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-4">
        {/* Parallax Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden accent-mesh">
          <motion.div style={{ y: y1 }} className="absolute top-[20%] left-[10%] text-2xl font-bold text-foreground/5 blur-[2px]">Sliding Window</motion.div>
          <motion.div style={{ y: y2 }} className="absolute top-[30%] right-[15%] text-3xl font-black text-accent-300/20 blur-[1px]">Docker</motion.div>
          <motion.div style={{ y: y3 }} className="absolute bottom-[40%] left-[20%] text-4xl font-bold text-accent-500/20 blur-[3px]">Kubernetes</motion.div>
          <motion.div style={{ y: y4 }} className="absolute top-[50%] right-[25%] text-xl font-medium text-accent-400/20 blur-[1px]">DBMS</motion.div>
          <motion.div style={{ y: y1 }} className="absolute bottom-[20%] right-[10%] text-5xl font-black text-foreground/5 blur-[4px]">Graph API</motion.div>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-4xl text-center space-y-8"
        >
          <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-foreground leading-[1.1]">
            Crack Your Placements.<br/>
            <span className="text-gradient-accent">
              Zero Distractions.
            </span>
          </motion.h1>

          <motion.p variants={fadeIn} className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium">
            The centralized utility tool for serious engineers. Track pattern-wise DSA, master core CS subjects, and organize your markdown notes seamlessly.
          </motion.p>

          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4">
            <Link href="/sign-up">
              <button className="flex items-center h-14 px-8 rounded-full text-lg font-bold text-white bg-gradient-to-r from-accent-600 via-accent-500 to-accent-400 hover:shadow-[0_0_40px_rgba(244,114,182,0.5)] transition-all hover:scale-105 active:scale-95 border-none">
                Start Preparing <ChevronRight className="ml-2 h-5 w-5" />
              </button>
            </Link>
            <a href="#features">
              <button className="flex items-center h-14 px-8 rounded-full text-lg font-bold text-foreground bg-foreground/5 hover:bg-foreground/10 backdrop-blur-md transition-all hover:scale-105 active:scale-95 border-none">
                View Features
              </button>
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* 3. The Markdown Feature (Highlight) */}
      <section id="editor" className="py-32 px-4 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
          whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">GitHub-Style Markdown</h2>
            <p className="text-xl text-muted-foreground">Write, preview, and organize your interview notes with live rendering.</p>
          </div>

          <div className="rounded-3xl bg-foreground/[0.03] backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(244,114,182,0.15)] overflow-hidden flex flex-col md:flex-row min-h-[500px]">
            {/* Editor Side */}
            <div className="flex-1 p-6 md:p-8 bg-foreground/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                </div>
                <span className="text-xs font-mono text-muted-foreground">notes.md</span>
              </div>
              <div className="font-mono text-sm md:text-base text-accent-700 space-y-2">
                <p><span className="text-accent-500">##</span> Sliding Window Pattern</p>
                <p className="text-foreground/80">Used to find a subarray or substring that satisfies a specific condition.</p>
                <br/>
                <p><span className="text-accent-500">```python</span></p>
                <p className="text-accent-600">def <span className="text-accent-500">max_sum</span>(arr, k):</p>
                <p className="pl-4 text-foreground/80">window_sum = sum(arr[:k])</p>
                <p className="pl-4 text-foreground/80">max_val = window_sum</p>
                <p><span className="text-accent-500">```</span></p>
              </div>
            </div>
            {/* Preview Side */}
            <div className="flex-1 p-6 md:p-8 bg-foreground/[0.02]">
              <div className="flex items-center mb-6">
                <span className="text-xs font-semibold text-accent-600 uppercase tracking-widest">Live Preview</span>
              </div>
              <div className="prose dark:prose-invert prose-slate max-w-none">
                <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-foreground/10">Sliding Window Pattern</h2>
                <p className="text-muted-foreground mb-4">Used to find a subarray or substring that satisfies a specific condition.</p>
                <div className="bg-foreground/5 rounded-xl p-4 font-mono text-sm shadow-inner">
                  <span className="text-accent-500">def</span> <span className="text-accent-600">max_sum</span>(arr, k):<br/>
                  <span className="text-foreground/80">&nbsp;&nbsp;&nbsp;&nbsp;window_sum = sum(arr[:k])</span><br/>
                  <span className="text-foreground/80">&nbsp;&nbsp;&nbsp;&nbsp;max_val = window_sum</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 4. Features Grid */}
      <section id="features" className="py-32 px-4 bg-foreground/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">Everything you need.</h2>
            <p className="text-xl text-muted-foreground">No bloat. No execution environments. Just pure tracking and notes.</p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                icon: LayoutDashboard,
                title: 'Pattern-wise DSA',
                desc: 'External link trackers and checkboxes for every major pattern.',
                color: 'text-accent-500',
                glow: 'group-hover:shadow-[0_0_30px_rgba(244,114,182,0.3)]',
              },
              {
                icon: Server,
                title: 'Core & Advanced',
                desc: 'Track OS, CN, DBMS, DevOps, and GenAI concepts seamlessly.',
                color: 'text-accent-400',
                glow: 'group-hover:shadow-[0_0_30px_rgba(249,168,212,0.3)]',
              },
              {
                icon: BookOpen,
                title: 'GitHub-style Notes',
                desc: 'Write rich markdown notes directly alongside your practice problems.',
                color: 'text-accent-600',
                glow: 'group-hover:shadow-[0_0_30px_rgba(236,72,153,0.3)]',
              },
              {
                icon: BrainCircuit,
                title: 'Cheat Sheets & CP',
                desc: 'Last-minute revision boards and competitive programming trackers.',
                color: 'text-accent-500',
                glow: 'group-hover:shadow-[0_0_30px_rgba(244,114,182,0.3)]',
              },
            ].map((feat, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                whileHover={{ y: -8 }}
                className={`group flex flex-col items-start p-8 rounded-3xl bg-foreground/[0.03] backdrop-blur-xl transition-all duration-300 ${feat.glow}`}
              >
                <div className="p-4 rounded-2xl bg-foreground/5 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feat.icon className={`h-8 w-8 ${feat.color}`} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feat.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 5. Progress Visualization Section */}
      <section id="progress" className="py-32 px-4 relative overflow-hidden" ref={progressRef}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] accent-mesh rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Track your journey,<br/>
              <span className="text-gradient-accent">
                one problem at a time.
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">Watch your completion rings fill up as you crush patterns and conquer core subjects.</p>
          </div>

          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Background Circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                className="text-foreground/5"
                strokeWidth="8"
              />
              {/* Animated Foreground Circle */}
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="283"
                strokeDashoffset={isProgressInView ? 70 : 283} // 283 is roughly 2 * pi * 45. 70 means ~75% complete.
                style={{
                  transition: "stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1) 0.5s"
                }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--accent-400)" />
                  <stop offset="100%" stopColor="var(--accent-500)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-foreground">75%</span>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest mt-1">Mastered</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="py-12 px-6 text-center bg-gradient-to-t from-foreground/5 to-transparent relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-center gap-6">
          <div className="flex items-center gap-2 text-accent-500">
            <Code2 className="h-5 w-5" />
            <span className="text-lg font-bold tracking-tight text-foreground">PlacementDeck</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} PlacementDeck. Zero distractions.
          </p>
        </div>
      </footer>
    </div>
  );
}
