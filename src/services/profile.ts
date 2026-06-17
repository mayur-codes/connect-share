import { apiRequest } from './apiClient';
import { normalizeScribe, normalizeOmzo, normalizeUser } from './normalize';
import type { Scribe, Omzo, User } from './api';

export interface ProfileBundle {
  user: User;
  bio?: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
  isFollowing: boolean;
  isBlocked: boolean;
  isPrivate: boolean;
  scribes: Scribe[];
  omzos: Omzo[];
}

export async function getProfile(username: string): Promise<ProfileBundle> {
  const raw = await apiRequest<any>(`/api/profile/${encodeURIComponent(username)}/`);
  const userRaw = raw?.user ?? raw?.profile ?? raw;
  return {
    user: normalizeUser(userRaw),
    bio: userRaw?.bio ?? '',
    followerCount: Number(userRaw?.follower_count ?? raw?.follower_count ?? 0),
    followingCount: Number(userRaw?.following_count ?? raw?.following_count ?? 0),
    postCount: Number(userRaw?.post_count ?? raw?.post_count ?? 0),
    isFollowing: Boolean(raw?.is_following ?? userRaw?.is_following),
    isBlocked: Boolean(raw?.is_blocked ?? userRaw?.is_blocked),
    isPrivate: Boolean(userRaw?.is_private ?? raw?.is_private),
    scribes: (raw?.scribes ?? raw?.posts ?? []).map(normalizeScribe),
    omzos: (raw?.omzos ?? raw?.videos ?? []).map(normalizeOmzo),
  };
}

export async function updateProfile(fields: {
  displayName?: string;
  username?: string;
  bio?: string;
  avatar?: File;
  cover_image?: File;
}) {
  const form = new FormData();
  if (fields.displayName) form.append('displayName', fields.displayName);
  if (fields.username) form.append('username', fields.username);
  if (fields.bio !== undefined) form.append('bio', fields.bio);
  if (fields.avatar) form.append('avatar', fields.avatar);
  if (fields.cover_image) form.append('cover_image', fields.cover_image);
  return apiRequest('/api/profile/', { method: 'POST', form });
}

export async function toggleFollow(username: string) {
  return apiRequest<{ is_following?: boolean }>('/api/toggle-follow/', {
    method: 'POST', body: { username },
  });
}

export async function toggleBlock(username: string) {
  return apiRequest('/api/toggle-block/', { method: 'POST', body: { username } });
}

export async function getFollowers(username: string): Promise<User[]> {
  const raw = await apiRequest<any>(`/api/profile/${encodeURIComponent(username)}/followers/`);
  return (raw?.followers ?? raw?.users ?? raw ?? []).map(normalizeUser);
}

export async function getFollowing(username: string): Promise<User[]> {
  const raw = await apiRequest<any>(`/api/profile/${encodeURIComponent(username)}/following/`);
  return (raw?.following ?? raw?.users ?? raw ?? []).map(normalizeUser);
}

export async function getSuggestedUsers(): Promise<User[]> {
  const raw = await apiRequest<any>('/api/suggested-users/');
  return (raw?.users ?? raw?.suggestions ?? raw ?? []).map(normalizeUser);
}

export async function getBlockedUsers(): Promise<User[]> {
  const raw = await apiRequest<any>('/api/blocked-users/');
  return (raw?.users ?? raw ?? []).map(normalizeUser);
}

export async function heartbeat() {
  try { await apiRequest('/api/user/heartbeat/', { method: 'POST' }); } catch {/* */}
}

export async function updateTheme(theme: string) {
  return apiRequest('/api/user/update-theme/', { method: 'POST', body: { theme } });
}
