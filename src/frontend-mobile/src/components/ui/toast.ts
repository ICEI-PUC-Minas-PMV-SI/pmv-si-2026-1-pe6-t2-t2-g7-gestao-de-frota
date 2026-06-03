import { getApiErrorMessage } from "../../utils/apiError";

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

export function notifyApiError(error: unknown, fallback?: string) {
  showToast({
    message: getApiErrorMessage(error) || fallback || "Não foi possível concluir a requisição.",
    tone: "error",
  });
}

export function notifySuccess(message: string) {
  showToast({ message, tone: "success" });
}

export function subscribeToast(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
