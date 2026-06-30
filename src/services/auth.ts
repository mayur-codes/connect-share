import { apiRequest, setToken } from './apiClient';
import { normalizeUser } from './normalize';
import type { User } from './api';
import { USER_STORAGE_KEY } from './config';

export interface LoginResponse {
  success: boolean;
  auth_token: string;
  user: any;
  profile_completion_required?: boolean;
}

export async function login(email: string, password: string): Promise<User> {
  const res = await apiRequest<LoginResponse>('/api/login/', {
    method: 'POST', body: { email, password }, auth: false,
  });
  setToken(res.auth_token);
  const user = normalizeUser(res.user, {
    profileCompletionRequired: res.profile_completion_required,
  });
  try { localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user)); } catch {/* */}
  return user;
}

export async function checkAvailability(payload: { username?: string; email?: string }) {
  return apiRequest('/api/check-availability/', { method: 'POST', body: payload, auth: false });
}

export interface RegisterResponse {
  success: boolean;
  requires_otp?: boolean;
  email?: string;
  profile_completion_required?: boolean;
  next_step?: string;
}

export async function register(payload: { email: string; password: string }): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>('/api/register/', {
    method: 'POST', body: payload, auth: false,
  });
}

export interface VerifyOtpResponse extends LoginResponse {
  next_step?: string;
}

export async function verifyEmailOtp(email: string, otp: string): Promise<User> {
  const res = await apiRequest<VerifyOtpResponse>('/api/verify-email-otp/', {
    method: 'POST', body: { email, otp }, auth: false,
  });
  if (res.auth_token) setToken(res.auth_token);
  const flag = res.profile_completion_required ?? (res.next_step === 'complete_profile');
  const user = normalizeUser(res.user ?? { email }, { profileCompletionRequired: flag });
  try { localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user)); } catch {/* */}
  return user;
}

export async function completeProfile(payload: {
  username: string;
  first_name: string;
  last_name: string;
}): Promise<User> {
  const res = await apiRequest<any>('/api/profile/', { method: 'POST', body: payload });
  const flag = res?.profile_completion_required ?? false;
  const userRaw = res?.user ?? res?.profile ?? { ...payload };
  const user = normalizeUser(userRaw, { profileCompletionRequired: flag });
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
  const flag =
    raw?.profile_completion_required ??
    raw?.user?.profile_completion_required ??
    undefined;
  const user = normalizeUser(raw?.user ?? raw, { profileCompletionRequired: flag });
  try { localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user)); } catch {/* */}
  return user;
}
