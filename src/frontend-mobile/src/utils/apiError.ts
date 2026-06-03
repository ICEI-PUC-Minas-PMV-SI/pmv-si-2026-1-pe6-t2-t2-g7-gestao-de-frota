import { isAxiosError } from "axios";

/** Extrai mensagem legível de erros HTTP (NestJS / class-validator). */
export function getApiErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) {
    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }
    return "Não foi possível concluir a requisição.";
  }

  const data = error.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (Array.isArray(data?.message)) {
    const text = data.message.filter(Boolean).join(" ");
    if (text) return text;
  }

  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (typeof error.message === "string" && error.message.trim()) {
    if (error.message === "Network Error") {
      return "Falha de rede ao comunicar com o servidor.";
    }
    if (/^Request failed with status code \d+$/i.test(error.message)) {
      return "Não foi possível concluir a requisição.";
    }
    return error.message;
  }

  return "Não foi possível concluir a requisição.";
}
