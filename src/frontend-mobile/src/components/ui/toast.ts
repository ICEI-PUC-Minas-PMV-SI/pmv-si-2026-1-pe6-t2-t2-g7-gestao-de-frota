type ToastTone = "error" | "success" | "info";

export type ToastPayload = {
  message: string;
  tone?: ToastTone;
};

type Listener = (payload: ToastPayload) => void;

const listeners = new Set<Listener>();

export function showToast(payload: ToastPayload) {
  listeners.forEach((listener) => listener(payload));
}

export function subscribeToast(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
