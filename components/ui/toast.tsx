'use client';

import * as React from 'react';
import { toast as sonnerToast } from 'sonner';
import { Toaster } from './sonner';

export { Toaster } from './sonner';
export { toast } from 'sonner';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export interface ToastOptions {
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'loading' | string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick: () => void;
  };
}

export function useToast() {
  const add = React.useCallback((title: string, options?: ToastOptions) => {
    const desc = options?.description;
    const type = options?.type;
    const duration = options?.duration;
    const action = options?.action;
    const cancel = options?.cancel;

    const opts = { description: desc, duration, action, cancel };

    switch (type) {
      case 'success':
        return sonnerToast.success(title, opts);
      case 'error':
        return sonnerToast.error(title, opts);
      case 'warning':
        return sonnerToast.warning(title, opts);
      case 'info':
        return sonnerToast.info(title, opts);
      case 'loading':
        return sonnerToast.loading(title, opts);
      default:
        return sonnerToast(title, opts);
    }
  }, []);

  return React.useMemo(
    () => ({
      add,
      success: (title: string, opts?: ToastOptions) => sonnerToast.success(title, opts),
      error: (title: string, opts?: ToastOptions) => sonnerToast.error(title, opts),
      warning: (title: string, opts?: ToastOptions) => sonnerToast.warning(title, opts),
      info: (title: string, opts?: ToastOptions) => sonnerToast.info(title, opts),
      dismiss: sonnerToast.dismiss,
    }),
    [add]
  );
}
