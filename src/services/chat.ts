import { apiRequest } from './apiClient';
import { normalizeChat, normalizeMessage } from './normalize';
import type { Chat, Message } from './api';

export async function listChats(): Promise<Chat[]> {
  const raw = await apiRequest<any>('/api/chats/');
  const list = raw?.chats ?? raw?.results ?? raw ?? [];
  return (list as any[]).map(normalizeChat);
}

export async function createChat(username: string) {
  return apiRequest<any>('/api/create-chat/', { method: 'POST', body: { username } });
}

export interface MessagesPage {
  messages: Message[];
  hasMore: boolean;
  nextCursor: number | null;
  isRequest?: boolean;
}

export async function getMessages(
  chatId: string,
  currentUserId: string,
  opts: { limit?: number; beforeId?: number; afterId?: number } = {}
): Promise<MessagesPage> {
  const raw = await apiRequest<any>(`/api/chat/${chatId}/messages/`, {
    query: { limit: opts.limit ?? 50, before_id: opts.beforeId, after_id: opts.afterId },
  });
  const list = raw?.messages ?? raw?.results ?? [];
  return {
    messages: (list as any[]).map((m) => normalizeMessage(m, currentUserId)),
    hasMore: Boolean(raw?.pagination?.has_more),
    nextCursor: raw?.pagination?.next_cursor ?? null,
    isRequest: Boolean(raw?.is_request ?? raw?.is_dm_request),
  };
}

export async function sendMessage(input: {
  chatId: string;
  content?: string;
  media?: File;
  oneTime?: boolean;
  replyTo?: string;
  sharedScribeId?: string;
  sharedOmzoId?: string;
}) {
  const form = new FormData();
  form.append('chat_id', input.chatId);
  if (input.content) form.append('content', input.content);
  if (input.media) form.append('media', input.media);
  if (input.oneTime) form.append('one_time', 'true');
  if (input.replyTo) form.append('reply_to', input.replyTo);
  if (input.sharedScribeId) form.append('shared_scribe_id', input.sharedScribeId);
  if (input.sharedOmzoId) form.append('shared_omzo_id', input.sharedOmzoId);
  return apiRequest('/api/send-message/', { method: 'POST', form });
}

export async function markChatRead(chatId: string) {
  try { await apiRequest(`/api/chat/${chatId}/mark-read/`, { method: 'POST' }); } catch {/* */}
}

export async function setTyping(chatId: string, isTyping: boolean) {
  try {
    await apiRequest(`/api/chat/${chatId}/typing/`, { method: 'POST', body: { is_typing: isTyping } });
  } catch {/* */}
}

// DM requests
export async function acceptDmRequest(chatId: string) {
  return apiRequest(`/api/dm-requests/${chatId}/accept/`, { method: 'POST' });
}
export async function declineDmRequest(chatId: string) {
  return apiRequest(`/api/dm-requests/${chatId}/decline/`, { method: 'POST' });
}
