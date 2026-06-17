import { apiRequest } from './apiClient';
import { normalizeStory, normalizeUser } from './normalize';
import type { Story, User } from './api';

export interface StoryGroup {
  user: User;
  stories: Story[];
}

export async function followingStories(): Promise<StoryGroup[]> {
  const raw = await apiRequest<any>('/api/following-stories/');
  const list = raw?.story_groups ?? raw?.groups ?? raw?.users ?? raw ?? [];
  return (list as any[]).map((g) => ({
    user: normalizeUser(g.user ?? g),
    stories: (g.stories ?? []).map(normalizeStory),
  }));
}

export interface CreateStoryInput {
  storyType: 'text' | 'image' | 'video';
  content?: string;
  media?: File;
  backgroundColor?: string;
  textColor?: string;
  textPosition?: 'top' | 'center' | 'bottom';
  audience?: 'all' | 'close_friends';
}

export async function createStory(input: CreateStoryInput) {
  const form = new FormData();
  form.append('story_type', input.storyType);
  if (input.content) form.append('content', input.content);
  if (input.media) form.append('media', input.media);
  if (input.backgroundColor) form.append('background_color', input.backgroundColor);
  if (input.textColor) form.append('text_color', input.textColor);
  if (input.textPosition) form.append('text_position', input.textPosition);
  if (input.audience) form.append('audience', input.audience);
  return apiRequest('/api/create-story/', { method: 'POST', form });
}

export async function markViewed(storyId: string) {
  try { await apiRequest('/api/story/mark-viewed/', { method: 'POST', body: { story_id: storyId } }); }
  catch {/* */}
}

export async function toggleLike(storyId: string) {
  return apiRequest('/api/story/toggle-like/', { method: 'POST', body: { story_id: storyId } });
}

export async function addReply(storyId: string, content: string) {
  return apiRequest('/api/story/add-reply/', {
    method: 'POST', body: { story_id: storyId, content },
  });
}

export async function repostStory(storyId: string) {
  return apiRequest('/api/story/repost/', { method: 'POST', body: { story_id: storyId } });
}
