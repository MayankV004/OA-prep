/**
 * Motion Theme Configuration
 * Inspired by Motion UI (motion.dev) spring physics tokens.
 */

export const motionTheme = {
  transitions: {
    // Quick, responsive micro-interactions (clicks, toggles, badges)
    snap: { type: 'spring' as const, stiffness: 400, damping: 30 },
    // Standard UI reveals and form controls
    ui: { type: 'spring' as const, stiffness: 250, damping: 28 },
    // Smooth large surface motion and card transitions
    gentle: { type: 'spring' as const, stiffness: 90, damping: 18 },
    // Bouncy celebratory and success states
    lively: { type: 'spring' as const, stiffness: 320, damping: 16 },
  },
  stagger: {
    base: 0.07,
    slow: 0.12,
  },
  travel: {
    enter: 18,
    section: 36,
  },
} as const;

export const authContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: motionTheme.stagger.base,
    },
  },
};

export const authItemVariants = {
  hidden: { opacity: 0, y: motionTheme.travel.enter },
  show: {
    opacity: 1,
    y: 0,
    transition: motionTheme.transitions.ui,
  },
};
