import { apiRequest } from './apiClient';
import { normalizeUser, normalizeScribe, normalizeOmzo } from './normalize';
import type { User, Scribe, Omzo } from './api';

export interface GlobalSearchResult {
  users: User[];
  scribes: Scribe[];
  omzos: Omzo[];
  hashtags: string[];
}

export async function globalSearch(q: string): Promise<GlobalSearchResult> {
  if (!q.trim()) return { users: [], scribes: [], omzos: [], hashtags: [] };
  const raw = await apiRequest<any>('/api/global-search/', { query: { q } });
  return {
    users: (raw?.users ?? []).map(normalizeUser),
    scribes: (raw?.scribes ?? raw?.posts ?? []).map(normalizeScribe),
    omzos: (raw?.omzos ?? []).map(normalizeOmzo),
    hashtags: raw?.hashtags ?? [],
  };
}

export async function searchUsers(q: string): Promise<User[]> {
  if (!q.trim()) return [];
  const raw = await apiRequest<any>('/api/search-users/', { query: { q } });
  return (raw?.users ?? raw?.results ?? raw ?? []).map(normalizeUser);
}

export async function trendingHashtags(): Promise<string[]> {
  const raw = await apiRequest<any>('/api/trending-hashtags/');
  return raw?.hashtags ?? raw ?? [];
}
