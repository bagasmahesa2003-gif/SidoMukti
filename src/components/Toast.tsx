import { useAppStore } from '../store';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ToastContainer() {
  const { toasts, removeToast } = useAppStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 min-w-[280px] rounded-lg shadow-lg border text-sm font-medium
              ${toast.type === 'success' ? 'bg-brand-50 border-brand-100 text-brand-700' : ''}
              ${toast.type === 'error' ? 'bg-red-50 border-red-100 text-red-700' : ''}
              ${toast.type === 'info' ? 'bg-blue-50 border-blue-100 text-blue-700' : ''}
            `}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-brand-500" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
            
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="opacity-70 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
