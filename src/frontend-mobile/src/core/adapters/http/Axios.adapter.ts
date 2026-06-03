import axios, { isAxiosError } from "axios";
import { showToast } from "../../../components/ui/toast";
import {
  HttpAdapter,
  HttpDelete,
  HttpGet,
  HttpPatch,
  HttpPost,
  HttpPut,
  HttpResponse,
} from "./interface";

function toHeadersRecord(
  headers: Headers | Record<string, any> | undefined,
): Record<string, string> | undefined {
  if (!headers) return undefined;
  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }
  return headers as Record<string, string>;
}

function fromAxiosHeaders(headers: any): Headers {
  return new Headers(Object.entries(headers ?? {}) as [string, string][]);
}

function getAxiosErrorMessage(error: unknown) {
  if (!isAxiosError(error)) {
    return "Não foi possível concluir a requisição.";
  }

  const data = error.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (Array.isArray(data?.message)) {
    return data.message.filter(Boolean).join(" ");
  }

  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (typeof error.message === "string" && error.message.trim()) {
    if (error.message === "Network Error") {
      return "Falha de rede ao comunicar com o servidor.";
    }
    return error.message;
  }

  return "Não foi possível concluir a requisição.";
}

async function withToast<T>(request: () => Promise<HttpResponse<T>>) {
  try {
    return await request();
  } catch (error) {
    showToast({ message: getAxiosErrorMessage(error), tone: "error" });
    throw error;
  }
}

export class AxiosAdapter implements HttpAdapter {
  async get<T>({ url, headers }: HttpGet): Promise<HttpResponse<T>> {
    return withToast(async () => {
      const res = await axios.get<T>(url, { headers: toHeadersRecord(headers) });
      return {
        headers: fromAxiosHeaders(res.headers),
        body: res.data,
        status: res.status,
      };
    });
  }

  async post<T>({ url, headers, body }: HttpPost): Promise<HttpResponse<T>> {
    return withToast(async () => {
      const res = await axios.post<T>(url, body, {
        headers: toHeadersRecord(headers),
      });
      return {
        headers: fromAxiosHeaders(res.headers),
        body: res.data,
        status: res.status,
      };
    });
  }

  async patch<T>({ url, headers, body }: HttpPatch): Promise<HttpResponse<T>> {
    return withToast(async () => {
      const res = await axios.patch<T>(url, body, {
        headers: toHeadersRecord(headers),
      });
      return {
        headers: fromAxiosHeaders(res.headers),
        body: res.data,
        status: res.status,
      };
    });
  }

  async put<T>({ url, headers, body }: HttpPut): Promise<HttpResponse<T>> {
    return withToast(async () => {
      const res = await axios.put<T>(url, body, {
        headers: toHeadersRecord(headers),
      });
      return {
        headers: fromAxiosHeaders(res.headers),
        body: res.data,
        status: res.status,
      };
    });
  }

  async delete<T>({ url, headers }: HttpDelete): Promise<HttpResponse<T>> {
    return withToast(async () => {
      const res = await axios.delete<T>(url, {
        headers: toHeadersRecord(headers),
      });
      return {
        headers: fromAxiosHeaders(res.headers),
        body: res.data,
        status: res.status,
      };
    });
  }
}
