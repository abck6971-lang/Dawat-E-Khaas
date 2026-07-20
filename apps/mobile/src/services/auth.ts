import { API_BASE_URL } from '../config/api';

export interface AuthCustomer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export interface AuthResult {
  success: boolean;
  token?: string;
  customer?: AuthCustomer;
  error?: string;
}

export async function registerCustomer(
  name: string,
  email: string,
  phone: string,
  password: string,
): Promise<AuthResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, token: data.token, customer: data.customer };
  } catch {
    return { success: false, error: 'Network error. Please check your connection.' };
  }
}

export async function loginCustomer(email: string, password: string): Promise<AuthResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, token: data.token, customer: data.customer };
  } catch {
    return { success: false, error: 'Network error. Please check your connection.' };
  }
}

export async function getMyProfile(token: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
