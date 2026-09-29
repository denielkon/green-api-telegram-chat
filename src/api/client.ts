import type { Credentials } from '../types';

const API_URL = 'https://api.green-api.com';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function endpoint(
  { idInstance, apiTokenInstance }: Credentials,
  method: string,
  tail = '',
) {
  return `${API_URL}/waInstance${idInstance}/${method}/${apiTokenInstance}${tail}`;
}

export async function request(target: string, init?: RequestInit) {
  const res = await fetch(target, init);

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new ApiError(res.status, 'Неверный idInstance или токен');
    }
    if (res.status === 429) {
      throw new ApiError(res.status, 'Слишком много запросов, подождите немного');
    }
    throw new ApiError(res.status, `GREEN-API ответил ${res.status}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const isAuthError = (error: unknown) =>
  error instanceof ApiError && (error.status === 401 || error.status === 403);
