import { apiRequest } from './apiClient';
import { normalizeNotification } from './normalize';
import type { Notification } from './api';

export async function getActivity(): Promise<Notification[]> {
  const raw = await apiRequest<any>('/api/activity/');
  const list = raw?.activity ?? raw?.notifications ?? raw?.results ?? raw ?? [];
  return (list as any[]).map(normalizeNotification);
}

export async function markRead(id: string) {
  try { await apiRequest(`/api/notifications/${id}/mark-read/`, { method: 'POST' }); }
  catch {/* */}
}
