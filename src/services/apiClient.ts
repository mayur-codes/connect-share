import { REST_BASE_URL, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from './config';

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {/* ignore */}
}

let unauthorizedHandler: (() => void) | null = null;
export function setUnauthorizedHandler(fn: (() => void) | null) {
  unauthorizedHandler = fn;
}

interface RequestOptions {
  method?: string;
  body?: any;            // JSON object
  form?: FormData;       // multipart
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
  auth?: boolean;        // default true
  headers?: Record<string, string>;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const base = path.startsWith('http') ? path : `${REST_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  if (!query) return base;
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.append(k, String(v));
  });
  const qs = params.toString();
  return qs ? `${base}${base.includes('?') ? '&' : '?'}${qs}` : base;
}

export async function apiRequest<T = any>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, form, query, signal, auth = true, headers = {} } = opts;
  const url = buildUrl(path, query);

  const finalHeaders: Record<string, string> = { Accept: 'application/json', ...headers };
  if (auth) {
    const token = getToken();
    if (token) finalHeaders.Authorization = `Token ${token}`;
  }

  let payload: BodyInit | undefined;
  if (form) {
    payload = form;
    // Let the browser set the multipart boundary
  } else if (body !== undefined) {
    payload = JSON.stringify(body);
    finalHeaders['Content-Type'] = 'application/json';
  }

  let res: Response;
  try {
    res = await fetch(url, { method, headers: finalHeaders, body: payload, signal });
  } catch (err: any) {
    throw new ApiError(err?.message || 'Network error', 0);
  }

  let data: any = null;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try { data = await res.json(); } catch { data = null; }
  } else {
    try { data = await res.text(); } catch { data = null; }
  }

  if (res.status === 401) {
    try { localStorage.removeItem(TOKEN_STORAGE_KEY); localStorage.removeItem(USER_STORAGE_KEY); } catch {/* */}
    unauthorizedHandler?.();
    throw new ApiError(data?.error || 'Unauthorized', 401, data);
  }

  if (!res.ok) {
    throw new ApiError(data?.error || data?.detail || `HTTP ${res.status}`, res.status, data);
  }

  // Backend sometimes returns {success:false} with HTTP 200.
  if (data && typeof data === 'object' && data.success === false) {
    throw new ApiError(data.error || 'Request failed', res.status, data);
  }

  return data as T;
}
