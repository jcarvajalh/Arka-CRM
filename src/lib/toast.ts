export type ToastType = 'success' | 'error' | 'info';

export interface ToastDetail {
  id: string;
  message: string;
  type: ToastType;
}

export const TOAST_EVENT = 'arka-toast';

export function showToast(message: string, type: ToastType = 'info') {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<ToastDetail>(TOAST_EVENT, {
      detail: { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, message, type },
    })
  );
}
