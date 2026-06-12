import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface Props {
  title: string;
  onClose: () => void;
  variant?: 'center' | 'drawer';
  children: ReactNode;
  footer?: ReactNode;
}

export default function Modal({ title, onClose, variant = 'center', children, footer }: Props) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const isDrawer = variant === 'drawer';

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={
          isDrawer
            ? 'animate-slide-in-right relative ml-auto flex h-full w-full max-w-md flex-col border-l shadow-xl'
            : 'relative m-auto flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl border shadow-xl'
        }
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
      >
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <h2 className="text-base font-medium">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-md p-1 opacity-60 transition-opacity hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/5"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
        {footer && (
          <div
            className="flex items-center justify-end gap-2 border-t px-6 py-4"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
