import { apiRequest } from './apiClient';
import { normalizeOmzo } from './normalize';
import type { Omzo } from './api';

export interface OmzoBatch {
  items: Omzo[];
  nextCursor: string | null;
  hasMore: boolean;
  totalAvailable: number;
}

export interface OmzoBatchQuery {
  sessionId: string;
  cursor?: string | null;
  limit?: number;
  exclude?: string[];
  appVersion?: string;
  locale?: string;
  region?: string;
  networkClass?: 'wifi' | '5g' | '4g' | '3g' | '2g' | 'offline';
}

export async function batch(q: OmzoBatchQuery): Promise<OmzoBatch> {
  const raw = await apiRequest<any>('/api/omzo/batch/', {
    query: {
      session_id: q.sessionId,
      cursor: q.cursor ?? undefined,
      limit: q.limit ?? 10,
      exclude: q.exclude?.length ? q.exclude.join(',') : undefined,
      app_version: q.appVersion,
      locale: q.locale,
      region: q.region,
      network_class: q.networkClass,
    },
  });
  return {
    items: (raw?.data ?? []).map(normalizeOmzo),
    nextCursor: raw?.next_cursor ?? null,
    hasMore: Boolean(raw?.has_more),
    totalAvailable: Number(raw?.total_available ?? 0),
  };
}

export type TelemetryEvent =
  | 'visible' | 'progress' | 'pause' | 'exit' | 'complete'
  | 'background' | 'replay' | 'share' | 'not_interested' | 'hide_creator';

export interface TrackViewInput {
  omzoId: string;
  impressionId?: string;
  sessionId: string;
  eventType: TelemetryEvent;
  source?: 'omzo_tab' | 'explore' | 'viewer';
  watchMs?: number;
  durationMs?: number;
  loopCount?: number;
}

export async function trackView(input: TrackViewInput): Promise<void> {
  const event_id = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
  try {
    await apiRequest('/api/omzo/track-view/', {
      method: 'POST',
      body: {
        omzo_id: Number(input.omzoId) || input.omzoId,
        impression_id: input.impressionId,
        session_id: input.sessionId,
        event_id,
        source: input.source ?? 'omzo_tab',
        event_type: input.eventType,
        watch_ms: input.watchMs ?? 0,
        duration_ms: input.durationMs ?? 0,
        loop_count: input.loopCount ?? 0,
      },
    });
  } catch {/* telemetry is best-effort */}
}

export async function like(omzoId: string) {
  return apiRequest('/api/omzo/like/', { method: 'POST', body: { omzo_id: omzoId } });
}

export async function save(omzoId: string) {
  return apiRequest('/api/save-omzo/', { method: 'POST', body: { omzo_id: omzoId } });
}

export async function reportOmzo(omzoId: string, reason: string, copyrightType?: string) {
  return apiRequest('/api/omzo/report/', {
    method: 'POST',
    body: { omzo_id: omzoId, reason, copyright_type: copyrightType },
  });
}

export async function getOmzoDetails(omzoId: string): Promise<Omzo> {
  const raw = await apiRequest<any>(`/api/omzo/${omzoId}/details/`);
  return normalizeOmzo(raw?.omzo ?? raw);
}

export async function getOmzoComments(omzoId: string, limit = 50, offset = 0) {
  return apiRequest<any>(`/api/omzo/${omzoId}/comments/`, { query: { limit, offset } });
}

export async function addOmzoComment(omzoId: string, content: string, parentId?: string) {
  return apiRequest('/api/omzo/comment/', {
    method: 'POST', body: { omzo_id: omzoId, content, parent_id: parentId },
  });
}

export async function upload(input: {
  video: File;
  caption?: string;
  language?: string;
  topics?: string[];
  audioIdentifier?: string;
  durationMs?: number;
  width?: number;
  height?: number;
  bitrateKbps?: number;
}) {
  const form = new FormData();
  form.append('video', input.video);
  if (input.caption) form.append('caption', input.caption);
  if (input.language) form.append('language', input.language);
  if (input.topics?.length) form.append('topics', input.topics.join(','));
  if (input.audioIdentifier) form.append('audio_identifier', input.audioIdentifier);
  if (input.durationMs) form.append('duration_ms', String(input.durationMs));
  if (input.width) form.append('width', String(input.width));
  if (input.height) form.append('height', String(input.height));
  if (input.bitrateKbps) form.append('bitrate_kbps', String(input.bitrateKbps));
  return apiRequest('/api/omzo/upload/', { method: 'POST', form });
}

export async function deleteOmzo(omzoId: string) {
  return apiRequest('/api/omzo/delete/', { method: 'POST', body: { omzo_id: omzoId } });
}
