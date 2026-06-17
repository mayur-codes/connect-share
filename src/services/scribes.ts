import { apiRequest } from './apiClient';
import { normalizeScribe } from './normalize';
import type { Scribe } from './api';

export async function exploreFeed(page = 1, perPage = 20): Promise<Scribe[]> {
  const raw = await apiRequest<any>('/api/explore-feed/', { query: { page, per_page: perPage } });
  return (raw?.scribes ?? raw?.posts ?? raw?.results ?? raw ?? []).map(normalizeScribe);
}

export async function getScribe(id: string): Promise<Scribe> {
  const raw = await apiRequest<any>(`/api/scribe/${id}/`);
  return normalizeScribe(raw?.scribe ?? raw);
}

export async function getComments(id: string) {
  return apiRequest<any>(`/api/scribe/${id}/comments/`);
}

export async function toggleLike(scribeId: string) {
  return apiRequest('/api/toggle-like/', { method: 'POST', body: { scribe_id: scribeId } });
}

export async function toggleDislike(scribeId: string) {
  return apiRequest('/api/toggle-dislike/', { method: 'POST', body: { scribe_id: scribeId } });
}

export async function toggleSave(scribeId: string) {
  return apiRequest('/api/toggle-save-post/', { method: 'POST', body: { scribe_id: scribeId } });
}

export async function deletePost(scribeId: string) {
  return apiRequest('/api/delete-post/', { method: 'POST', body: { scribe_id: scribeId } });
}

export async function reportPost(scribeId: string, reason: string, details?: string) {
  return apiRequest('/api/report-post/', {
    method: 'POST', body: { scribe_id: scribeId, reason, details },
  });
}

export async function addComment(scribeId: string, content: string, parentId?: string) {
  return apiRequest('/api/add-comment/', {
    method: 'POST', body: { scribe_id: scribeId, content, parent_id: parentId },
  });
}

export async function repost(type: 'scribe' | 'omzo' | 'story' | 'post' | 'quote', id: string, content?: string) {
  return apiRequest('/api/repost/', { method: 'POST', body: { type, id, content } });
}

export interface CreateScribeInput {
  content?: string;
  image?: File;
  carouselImages?: File[];
  contentType?: 'text' | 'code_scribe';
  codeHtml?: string;
  codeCss?: string;
  codeJs?: string;
}

export async function createScribe(input: CreateScribeInput) {
  const form = new FormData();
  if (input.content) form.append('content', input.content);
  if (input.image) form.append('image', input.image);
  if (input.carouselImages?.length) {
    input.carouselImages.forEach((f) => form.append('carousel_images', f));
    form.append('is_carousel', 'true');
  }
  if (input.contentType) form.append('content_type', input.contentType);
  if (input.codeHtml) form.append('code_html', input.codeHtml);
  if (input.codeCss) form.append('code_css', input.codeCss);
  if (input.codeJs) form.append('code_js', input.codeJs);
  return apiRequest('/api/post-scribe/', { method: 'POST', form });
}

export async function getSavedItems() {
  return apiRequest<any>('/api/saved-items/');
}
