import { ToastContainer } from './Toast';
import { useToastStore } from '@/store/toastStore';

export const ToastProvider = () => {
  const { toasts, removeToast } = useToastStore();

  return <ToastContainer toasts={toasts} onClose={removeToast} />;
};
