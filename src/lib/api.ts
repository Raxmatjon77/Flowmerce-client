import { getStoredToken, TOKEN_KEY } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>) {
  const url = new URL(`${API_BASE_URL}${path}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === '') {
        continue;
      }
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  params?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  const token = getStoredToken();

  if (!token) {
    window.location.replace('/login');
    throw new Error('Not authenticated');
  }

  const response = await fetch(buildUrl(path, params), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.replace('/login');
      throw new Error('Session expired. Please sign in again.');
    }

    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function apiGet<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  return apiRequest<T>(path, { method: 'GET' }, params);
}

export function apiPost<T>(
  path: string,
  body?: unknown,
): Promise<T> {
  return apiRequest<T>(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function apiPatch<T>(
  path: string,
  body?: unknown,
): Promise<T> {
  return apiRequest<T>(path, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}
