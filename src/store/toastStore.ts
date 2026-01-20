import { create } from 'zustand';
import type { Toast, ToastType } from '@/components/ui/Toast';

interface ToastStore {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, duration?: number) => string;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

let toastIdCounter = 0;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  showToast: (message: string, type: ToastType = 'info', duration?: number) => {
    const id = `toast-${++toastIdCounter}`;
    const newToast: Toast = { id, message, type, duration };
    
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));
    
    return id;
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  success: (message: string, duration?: number) => {
    const id = `toast-${++toastIdCounter}`;
    const newToast: Toast = { id, message, type: 'success', duration };
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));
  },

  error: (message: string, duration?: number) => {
    const id = `toast-${++toastIdCounter}`;
    const newToast: Toast = { id, message, type: 'error', duration };
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));
  },

  info: (message: string, duration?: number) => {
    const id = `toast-${++toastIdCounter}`;
    const newToast: Toast = { id, message, type: 'info', duration };
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));
  },

  warning: (message: string, duration?: number) => {
    const id = `toast-${++toastIdCounter}`;
    const newToast: Toast = { id, message, type: 'warning', duration };
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));
  },
}));
