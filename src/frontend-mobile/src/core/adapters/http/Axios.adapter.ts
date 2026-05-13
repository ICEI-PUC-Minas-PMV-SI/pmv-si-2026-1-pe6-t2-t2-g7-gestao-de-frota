import axios from "axios";
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

export class AxiosAdapter implements HttpAdapter {
  async get<T>({ url, headers }: HttpGet): Promise<HttpResponse<T>> {
    const res = await axios.get<T>(url, { headers: toHeadersRecord(headers) });
    return {
      headers: fromAxiosHeaders(res.headers),
      body: res.data,
      status: res.status,
    };
  }

  async post<T>({ url, headers, body }: HttpPost): Promise<HttpResponse<T>> {
    const res = await axios.post<T>(url, body, {
      headers: toHeadersRecord(headers),
    });
    return {
      headers: fromAxiosHeaders(res.headers),
      body: res.data,
      status: res.status,
    };
  }

  async patch<T>({ url, headers, body }: HttpPatch): Promise<HttpResponse<T>> {
    const res = await axios.patch<T>(url, body, {
      headers: toHeadersRecord(headers),
    });
    return {
      headers: fromAxiosHeaders(res.headers),
      body: res.data,
      status: res.status,
    };
  }

  async put<T>({ url, headers, body }: HttpPut): Promise<HttpResponse<T>> {
    const res = await axios.put<T>(url, body, {
      headers: toHeadersRecord(headers),
    });
    return {
      headers: fromAxiosHeaders(res.headers),
      body: res.data,
      status: res.status,
    };
  }

  async delete<T>({ url, headers }: HttpDelete): Promise<HttpResponse<T>> {
    const res = await axios.delete<T>(url, {
      headers: toHeadersRecord(headers),
    });
    return {
      headers: fromAxiosHeaders(res.headers),
      body: res.data,
      status: res.status,
    };
  }
}
