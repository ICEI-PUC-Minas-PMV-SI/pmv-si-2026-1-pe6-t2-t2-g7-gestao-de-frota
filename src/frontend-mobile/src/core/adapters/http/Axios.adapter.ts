import axios, { isAxiosError } from "axios";
import {
  HttpAdapter,
  HttpDelete,
  HttpGet,
  HttpPatch,
  HttpPost,
  HttpPut,
  HttpResponse,
} from "./interface";

const API_TIMEOUT_MS = 45_000;

const httpClient = axios.create({
  timeout: API_TIMEOUT_MS,
});

function formatAxiosError(err: unknown, url: string): Error {
  if (isAxiosError(err)) {
    if (err.code === "ECONNABORTED") {
      return new Error(
        `API não respondeu a tempo (${url}). Se usa localtunnel, confira se o terminal do túnel ainda está aberto e se a URL no .env é a mais recente.`,
      );
    }
    if (err.message === "Network Error" || err.code === "ERR_NETWORK") {
      return new Error(
        `Sem conexão com a API (${url}). No celular use o IP do PC, adb reverse ou túnel HTTPS atualizado no .env.`,
      );
    }
    const status = err.response?.status;
    if (status === 408) {
      return new Error(
        `Timeout (408) em ${url}. O túnel (loca.lt) expirou ou caiu — reinicie: npx localtunnel --port 3030 e atualize EXPO_PUBLIC_API_URL.`,
      );
    }
    if (status === 502 || status === 503) {
      return new Error(
        `Túnel indisponível (${status}). Backend rodando? Reinicie o localtunnel e copie a URL nova para o .env.`,
      );
    }
    if (status) {
      return new Error(`API retornou ${status} em ${url}`);
    }
  }
  return err instanceof Error ? err : new Error("Erro de rede com a API.");
}

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

export class AxiosAdapter implements HttpAdapter {
  async get<T>({ url, headers }: HttpGet): Promise<HttpResponse<T>> {
    try {
      const res = await httpClient.get<T>(url, {
        headers: toHeadersRecord(headers),
      });
      return {
        headers: fromAxiosHeaders(res.headers),
        body: res.data,
        status: res.status,
      };
    } catch (err) {
      throw formatAxiosError(err, url);
    }
  }

  async post<T>({ url, headers, body }: HttpPost): Promise<HttpResponse<T>> {
    try {
      const res = await httpClient.post<T>(url, body, {
        headers: toHeadersRecord(headers),
      });
      return {
        headers: fromAxiosHeaders(res.headers),
        body: res.data,
        status: res.status,
      };
    } catch (err) {
      throw formatAxiosError(err, url);
    }
  }

  async patch<T>({ url, headers, body }: HttpPatch): Promise<HttpResponse<T>> {
    try {
      const res = await httpClient.patch<T>(url, body, {
        headers: toHeadersRecord(headers),
      });
      return {
        headers: fromAxiosHeaders(res.headers),
        body: res.data,
        status: res.status,
      };
    } catch (err) {
      throw formatAxiosError(err, url);
    }
  }

  async put<T>({ url, headers, body }: HttpPut): Promise<HttpResponse<T>> {
    try {
      const res = await httpClient.put<T>(url, body, {
        headers: toHeadersRecord(headers),
      });
      return {
        headers: fromAxiosHeaders(res.headers),
        body: res.data,
        status: res.status,
      };
    } catch (err) {
      throw formatAxiosError(err, url);
    }
  }

  async delete<T>({ url, headers }: HttpDelete): Promise<HttpResponse<T>> {
    try {
      const res = await httpClient.delete<T>(url, {
        headers: toHeadersRecord(headers),
      });
      return {
        headers: fromAxiosHeaders(res.headers),
        body: res.data,
        status: res.status,
      };
    } catch (err) {
      throw formatAxiosError(err, url);
    }
  }
}
