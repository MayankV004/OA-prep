'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Heading, Text } from '@/components/ui/typography';

/**
 * Right-hand panel for create and edit forms, so quick edits never cost a full
 * page navigation. Escape and backdrop both dismiss.
 */
function SlideOver({
  open,
  onOpenChange,
  title,
  description,
  footer,
  children,
  width = 'md',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  width?: 'md' | 'lg' | 'xl';
}) {
  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', onKeyDown);

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [onOpenChange, open]);

  const widthClass = {
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-2xl',
  }[width];

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => onOpenChange(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 38 }}
            className={cn(
              'absolute inset-y-0 right-0 flex w-full flex-col bg-surface shadow-e4',
              widthClass
            )}
          >
            <div className="flex items-start gap-3 p-5 pb-4">
              <div className="min-w-0 flex-1 space-y-1">
                <Heading level="section" as="h2">
                  {title}
                </Heading>
                {description ? (
                  <Text size="caption" tone="muted">
                    {description}
                  </Text>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => onOpenChange(false)}
                aria-label="Close panel"
                className="press grid size-9 shrink-0 place-items-center rounded-lg text-text-muted outline-none hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="h-px bg-divider" />

            <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>

            {footer ? (
              <>
                <div className="h-px bg-divider" />
                <div className="flex items-center justify-end gap-2 bg-surface-sunken p-4">
                  {footer}
                </div>
              </>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

export { SlideOver };
