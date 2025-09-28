import { type ZodSchema } from 'zod';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

type RequestOptions<T> = {
  method: HttpMethod;
  body?: unknown;
  schema?: ZodSchema<T>;
};

const DEFAULT_BASE_URL = 'http://localhost:8000';

let authTokenGetter: (() => string | null) | null = null;

export const setAuthTokenGetter = (getter: (() => string | null) | null) => {
  authTokenGetter = getter;
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

const resolveBaseUrl = () => {
  const value = import.meta.env.VITE_API_BASE_URL;
  return value && typeof value === 'string' && value.length > 0 ? value : DEFAULT_BASE_URL;
};

async function request<T>(path: string, options: RequestOptions<T>): Promise<T> {
  const baseUrl = resolveBaseUrl();
  const url = `${baseUrl}${path}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  const token = authTokenGetter?.() ?? null;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let body: string | undefined;
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  const response = await fetch(url, {
    method: options.method,
    headers,
    body,
    credentials: 'include',
  });

  if (!response.ok) {
    let errorMessage = response.statusText || 'Request failed';
    let payload: unknown = null;
    try {
      payload = await response.json();
      if (payload && typeof payload === 'object' && 'detail' in payload) {
        const detail = (payload as { detail?: unknown }).detail;
        if (typeof detail === 'string') {
          errorMessage = detail;
        }
      }
    } catch (error) {
      // ignore JSON parsing errors for error responses
    }
    throw new ApiError(response.status, errorMessage, payload);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json();
  if (!options.schema) {
    return data as T;
  }

  return options.schema.parse(data) as T;
}

export const apiClient = {
  get: async <T>(path: string, schema: ZodSchema<T>) => {
    return request<T>(path, { method: 'GET', schema });
  },
  post: async <T, B>(path: string, body: B, schema: ZodSchema<T>) => {
    return request<T>(path, { method: 'POST', body, schema });
  },
  patch: async <T, B>(path: string, body: B, schema: ZodSchema<T>) => {
    return request<T>(path, { method: 'PATCH', body, schema });
  },
  delete: async (path: string) => {
    await request(path, { method: 'DELETE' });
  },
};
