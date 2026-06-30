import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export interface Toast { id: string; type: ToastType; message: string }

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `${Date.now()}`;
    setToasts((p) => [...p, { id, type, message }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);

  const removeToast = useCallback((id: string) => setToasts((p) => p.filter((t) => t.id !== id)), []);

  return { toasts, addToast, removeToast };
}
