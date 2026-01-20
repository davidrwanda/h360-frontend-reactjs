import { useEffect } from 'react';
import { MdCheckCircle, MdError, MdInfo, MdWarning, MdClose } from 'react-icons/md';
import { cn } from '@/utils/cn';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const toastIcons = {
  success: MdCheckCircle,
  error: MdError,
  info: MdInfo,
  warning: MdWarning,
};

const toastStyles = {
  success: 'bg-azure-dragon border-azure-dragon/50 text-white',
  error: 'bg-smudged-lips border-smudged-lips/50 text-white',
  info: 'bg-azure-dragon border-azure-dragon/50 text-white',
  warning: 'bg-bright-halo border-bright-halo/50 text-carbon',
};

export const ToastComponent = ({ toast, onClose }: ToastProps) => {
  const Icon = toastIcons[toast.type];
  const duration = toast.duration ?? 5000;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, toast.id, onClose]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all',
        toastStyles[toast.type]
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className={cn(
          'flex-shrink-0 transition-colors',
          toast.type === 'warning' 
            ? 'text-carbon/60 hover:text-carbon' 
            : 'text-white/80 hover:text-white'
        )}
        aria-label="Close toast"
      >
        <MdClose className="h-4 w-4" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export const ToastContainer = ({ toasts, onClose }: ToastContainerProps) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-md w-full">
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};
