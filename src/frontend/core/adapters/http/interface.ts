export interface FormDataHeader {
  [key: string]: any;
}

export interface HttpResponse<T> {
  status: number;
  headers: Headers;
  body: T;
}

export interface HttpGet {
  url: string;
  headers?: Headers;
}

export interface HttpPost {
  url: string;
  headers?: Headers | FormDataHeader;
  body?: Record<string, any> | FormData;
}

export interface HttpPatch {
  url: string;
  headers?: Headers | FormDataHeader;
  body?: Record<string, any> | FormData;
}

export interface HttpPut {
  url: string;
  headers?: Headers | FormDataHeader;
  body?: Record<string, any> | FormData;
}

export interface HttpDelete {
  url: string;
  headers?: Headers;
}

export abstract class HttpAdapter {
  abstract get<T extends Record<string, any>>(
    props: HttpGet,
  ): Promise<HttpResponse<T>>;
  abstract post<T extends Record<string, any>>(
    props: HttpPost,
  ): Promise<HttpResponse<T>>;
  abstract patch<T extends Record<string, any>>(
    props: HttpPatch,
  ): Promise<HttpResponse<T>>;
  abstract put<T extends Record<string, any>>(
    props: HttpPut,
  ): Promise<HttpResponse<T>>;
  abstract delete<T extends Record<string, any>>(
    props: HttpDelete,
  ): Promise<HttpResponse<T>>;
}

