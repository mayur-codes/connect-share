import { apiRequest, setToken } from './apiClient';
import { normalizeUser } from './normalize';
import type { User } from './api';
import { USER_STORAGE_KEY } from './config';

export interface LoginResponse {
  success: boolean;
  auth_token: string;
  user: any;
}

export async function login(username: string, password: string): Promise<User> {
  const res = await apiRequest<LoginResponse>('/api/login/', {
    method: 'POST', body: { username, password }, auth: false,
  });
  setToken(res.auth_token);
  const user = normalizeUser(res.user);
  try { localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user)); } catch {/* */}
  return user;
}

export async function checkAvailability(payload: { username?: string; email?: string }) {
  return apiRequest('/api/check-availability/', { method: 'POST', body: payload, auth: false });
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  name: string;
  lastname?: string;
  phone_number?: string;
}

export async function register(payload: RegisterPayload) {
  return apiRequest('/api/register/', { method: 'POST', body: payload, auth: false });
}

export async function verifyEmailOtp(email: string, otp: string): Promise<User> {
  const res = await apiRequest<LoginResponse>('/api/verify-email-otp/', {
    method: 'POST', body: { email, otp }, auth: false,
  });
  if (res.auth_token) setToken(res.auth_token);
  const user = normalizeUser(res.user);
  try { localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user)); } catch {/* */}
  return user;
}

export async function sendForgotPasswordOtp(email: string) {
  return apiRequest('/api/send-forgot-password-otp/', { method: 'POST', body: { email }, auth: false });
}

export async function verifyForgotPasswordOtpAndReset(payload: {
  email: string; otp: string; new_password: string; confirm_password: string;
}) {
  return apiRequest('/api/verify-forgot-password-otp-and-reset/', {
    method: 'POST', body: payload, auth: false,
  });
}

export async function logout() {
  try { await apiRequest('/api/logout/', { method: 'POST' }); } catch {/* ignore */}
  setToken(null);
  try { localStorage.removeItem(USER_STORAGE_KEY); } catch {/* */}
}

export async function deleteAccount() {
  await apiRequest('/api/delete-account/', { method: 'POST' });
  setToken(null);
  try { localStorage.removeItem(USER_STORAGE_KEY); } catch {/* */}
}

export async function getCurrentProfile(): Promise<User> {
  const raw = await apiRequest<any>('/api/profile/');
  const user = normalizeUser(raw?.user ?? raw);
  try { localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user)); } catch {/* */}
  return user;
}
