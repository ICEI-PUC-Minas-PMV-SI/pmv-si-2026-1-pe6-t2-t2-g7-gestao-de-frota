import axios from "axios";
import { HttpAdapter, HttpDelete, HttpGet, HttpPatch, HttpPost, HttpPut, HttpResponse } from "./interface";

export class AxiosAdapter implements HttpAdapter {
  async get<T>({ url, headers }: HttpGet): Promise<HttpResponse<T>> {
    const reqNativeHeaders = headers
      ? Object.fromEntries(headers.entries())
      : undefined;
    const res = await axios.get<T>(url, {
      headers: reqNativeHeaders,
    });

    const resNativeHeaders = new Headers(
      Object.entries(res.headers) as [string, string][],
    );

    return {
      headers: resNativeHeaders,
      body: res.data,
      status: res.status,
    };
  }

  async post<T>({ url, headers, body }: HttpPost): Promise<HttpResponse<T>> {
    const reqNativeHeaders = headers
      ? headers instanceof Headers
        ? Object.fromEntries(headers.entries())
        : headers
      : undefined;
    const res = await axios.post<T>(url, body, {
      headers: reqNativeHeaders,
    });
    const resNativeHeaders = new Headers(
      Object.entries(res.headers) as [string, string][],
    );

    return {
      headers: resNativeHeaders,
      body: res.data,
      status: res.status,
    };
  }

  async patch<T>({ url, headers, body }: HttpPatch): Promise<HttpResponse<T>> {
    const reqNativeHeaders = headers
      ? headers instanceof Headers
        ? Object.fromEntries(headers.entries())
        : headers
      : undefined;
    const res = await axios.patch<T>(url, body, {
      headers: reqNativeHeaders,
    });
    const resNativeHeaders = new Headers(
      Object.entries(res.headers) as [string, string][],
    );

    return {
      headers: resNativeHeaders,
      body: res.data,
      status: res.status,
    };
  }

  async put<T>({ url, headers, body }: HttpPut): Promise<HttpResponse<T>> {
    const reqNativeHeaders = headers
      ? headers instanceof Headers
        ? Object.fromEntries(headers.entries())
        : headers
      : undefined;
    const res = await axios.put<T>(url, body, {
      headers: reqNativeHeaders,
    });
    const resNativeHeaders = new Headers(
      Object.entries(res.headers) as [string, string][],
    );

    return {
      headers: resNativeHeaders,
      body: res.data,
      status: res.status,
    };
  }

  async delete<T>({ url, headers }: HttpDelete): Promise<HttpResponse<T>> {
    const reqNativeHeaders = headers
      ? Object.fromEntries(headers.entries())
      : undefined;
    const res = await axios.delete<T>(url, {
      headers: reqNativeHeaders,
    });
    const resNativeHeaders = new Headers(
      Object.entries(res.headers) as [string, string][],
    );

    return {
      headers: resNativeHeaders,
      body: res.data,
      status: res.status,
    };
  }
}

