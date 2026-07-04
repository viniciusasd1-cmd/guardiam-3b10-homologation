const DEFAULT_API_BASE_URL = 'http://localhost:3001/api';

export type ApiErrorPayload = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

export class ApiError extends Error {
  statusCode: number;
  payload: ApiErrorPayload | string | null;

  constructor(
    statusCode: number,
    payload: ApiErrorPayload | string | null,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.payload = payload;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
};

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') ??
  DEFAULT_API_BASE_URL;

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const payload = await parsePayload(response);

  if (!response.ok) {
    const errorPayload = normalizeErrorPayload(payload);

    throw new ApiError(
      response.status,
      errorPayload,
      getErrorMessage(errorPayload, response.status),
    );
  }

  return payload as T;
}

async function parsePayload(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function getErrorMessage(payload: unknown, statusCode: number): string {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = (payload as ApiErrorPayload).message;
    return Array.isArray(message) ? message.join('\n') : String(message);
  }

  return `Erro HTTP ${statusCode}`;
}

function normalizeErrorPayload(payload: unknown): ApiErrorPayload | string | null {
  if (typeof payload === 'string' || payload === null) {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    return payload as ApiErrorPayload;
  }

  return null;
}

export function unwrapData<T>(response: { data: T }): T {
  return response.data;
}
