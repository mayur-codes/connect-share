export const REST_BASE_URL =
  (import.meta.env.VITE_REST_BASE_URL as string | undefined)?.replace(/\/+$/, '') ||
  'https://api.odnix.org';

export const WS_BASE_URL =
  (import.meta.env.VITE_WS_BASE_URL as string | undefined)?.replace(/\/+$/, '') ||
  'wss://api.odnix.org';

export const MEDIA_BASE_URL =
  (import.meta.env.VITE_MEDIA_BASE_URL as string | undefined)?.replace(/\/+$/, '') ||
  REST_BASE_URL;

export const TOKEN_STORAGE_KEY = 'odnix_auth_token';
export const USER_STORAGE_KEY = 'odnix_current_user';

/** Resolve a possibly-relative media path against MEDIA_BASE_URL. */
export function resolveMedia(url: string | null | undefined): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) return url;
  return `${MEDIA_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}
