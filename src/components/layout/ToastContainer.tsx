import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { TOAST_EVENT, type ToastDetail } from '../../lib/toast';

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const ACCENTS = {
  success: 'text-green-400',
  error: 'text-red-400',
  info: 'text-[#1e96ff]',
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastDetail[]>([]);

  useEffect(() => {
    function handler(e: Event) {
      const detail = (e as CustomEvent<ToastDetail>).detail;
      setToasts((prev) => [...prev, detail]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== detail.id));
      }, 4000);
    }
    window.addEventListener(TOAST_EVENT, handler);
    return () => window.removeEventListener(TOAST_EVENT, handler);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type];
        return (
          <div
            key={toast.id}
            className="flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
          >
            <Icon size={16} className={`mt-0.5 shrink-0 ${ACCENTS[toast.type]}`} />
            <p className="flex-1" style={{ color: 'var(--text-primary)' }}>
              {toast.message}
            </p>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="shrink-0 opacity-50 transition-opacity hover:opacity-100"
              aria-label="Cerrar"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
