const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
export const TOKEN_KEY = 'flowmerce.customer.token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getStoredToken();
}

export function getStoredUserId(): string | null {
  const token = getStoredToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as { sub?: string };
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

export async function login(userId: string, password: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, role: 'customer', password }),
  });
  if (!response.ok) throw new Error('Invalid credentials. Please try again.');
  const data = (await response.json()) as { accessToken: string };
  localStorage.setItem(TOKEN_KEY, data.accessToken);
  return data.accessToken;
}

export async function register(payload: { userId: string; email: string; name: string; password: string }): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Registration failed. Please try again.');
  }
  const data = (await response.json()) as { accessToken: string };
  localStorage.setItem(TOKEN_KEY, data.accessToken);
  return data.accessToken;
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('flowmerce.cart');
  window.location.replace('/login');
}
