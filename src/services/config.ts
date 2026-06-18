// In dev, leave REST base empty so requests go to the Vite dev server origin
// (e.g. http://127.0.0.1:8080/api/...) and get proxied to api.odnix.org.
// In prod, use the configured absolute URL.
const DEV = import.meta.env.DEV;

export const REST_BASE_URL = DEV
  ? ''
  : ((import.meta.env.VITE_REST_BASE_URL as string | undefined)?.replace(/\/+$/, '') ||
     'https://api.odnix.org');

export const WS_BASE_URL =
  (import.meta.env.VITE_WS_BASE_URL as string | undefined)?.replace(/\/+$/, '') ||
  'wss://api.odnix.org';

export const MEDIA_BASE_URL =
  (import.meta.env.VITE_MEDIA_BASE_URL as string | undefined)?.replace(/\/+$/, '') ||
  'https://api.odnix.org';

export const TOKEN_STORAGE_KEY = 'odnix_auth_token';
export const USER_STORAGE_KEY = 'odnix_current_user';

// Temporary diagnostic log so we can confirm the dev base URL in the browser console.
if (typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  console.log('[ODNIX] Dev API baseURL:', REST_BASE_URL || '(relative /api → Vite proxy)');
}

/** Resolve a possibly-relative media path against MEDIA_BASE_URL. */
export function resolveMedia(url: string | null | undefined): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) return url;
  return `${MEDIA_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}
