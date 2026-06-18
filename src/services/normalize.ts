import { resolveMedia } from './config';
import type { User, Story, Chat, Message, Scribe, Omzo, Notification } from './api';

function pickAvatar(o: any): string {
  return resolveMedia(
    o?.profile_picture_url ?? o?.profile_picture ?? o?.avatar_url ?? o?.avatar ?? o?.user_avatar ?? ''
  );
}

export function normalizeUser(raw: any): User {
  if (!raw) return {} as User;
  const id = String(raw.id ?? raw.user_id ?? raw.pk ?? '');
  const username = raw.username ?? raw.user_username ?? '';
  return {
    id,
    username,
    displayName:
      raw.full_name ||
      raw.name ||
      [raw.first_name, raw.lastname || raw.last_name].filter(Boolean).join(' ').trim() ||
      username,
    avatar: pickAvatar(raw) || `https://i.pravatar.cc/150?u=${username || id}`,
    isOnline: Boolean(raw.is_online),
    isVerified: Boolean(raw.is_verified),
  };
}

function parseDate(value: any): Date {
  if (!value) return new Date();
  const d = new Date(value);
  return isNaN(d.getTime()) ? new Date() : d;
}

export function normalizeStory(raw: any): Story {
  const user = normalizeUser(raw.user ?? raw);
  const type: Story['type'] = raw.story_type === 'video' || raw.media_type === 'video' ? 'video' : 'image';
  return {
    id: String(raw.id ?? raw.story_id),
    user,
    content: resolveMedia(raw.media_url ?? raw.content ?? raw.image_url ?? raw.video_url ?? ''),
    type,
    createdAt: parseDate(raw.created_at ?? raw.created_at_iso ?? raw.timestamp),
    viewed: Boolean(raw.viewed ?? raw.has_viewed),
  };
}

export function normalizeChat(raw: any): Chat {
  const otherUser =
    raw.other_user ?? raw.user ?? raw.participant ?? raw.participants?.[0] ?? {};
  return {
    id: String(raw.id ?? raw.chat_id),
    user: normalizeUser(otherUser),
    lastMessage:
      raw.last_message?.content ?? raw.last_message_text ?? raw.last_message ?? '',
    timestamp: parseDate(
      raw.last_message_time ?? raw.last_message?.created_at ?? raw.updated_at ?? raw.created_at
    ),
    unreadCount: Number(raw.unread_count ?? 0),
    isPrivate: Boolean(raw.is_private ?? false),
    isNewRequest: Boolean(raw.is_request ?? raw.is_dm_request ?? false),
  };
}

export function normalizeMessage(raw: any, currentUserId?: string): Message {
  const senderId = String(raw.sender_id ?? raw.sender?.id ?? raw.user_id ?? '');
  let type: Message['type'] = 'text';
  if (raw.media_url || raw.media) {
    const m = (raw.media_type || raw.type || '').toLowerCase();
    if (m.includes('video')) type = 'video';
    else if (m.includes('image') || m.includes('photo')) type = 'image';
    else type = 'file';
  }
  const isOwn = currentUserId ? senderId === currentUserId : false;

  // Reply preview
  const r = raw.reply_to ?? raw.replied_to ?? raw.parent_message;
  let replyTo: Message['replyTo'] | undefined;
  if (r) {
    let rType: Message['type'] = 'text';
    if (r.media_url || r.media) {
      const m = (r.media_type || '').toLowerCase();
      if (m.includes('video')) rType = 'video';
      else if (m.includes('image')) rType = 'image';
      else rType = 'file';
    }
    replyTo = {
      id: String(r.id ?? r.message_id ?? ''),
      senderName: r.sender?.username || r.sender_username || r.sender_name || 'User',
      content: rType === 'text'
        ? (r.content ?? r.text ?? '')
        : resolveMedia(r.media_url ?? r.media ?? ''),
      type: rType,
    };
  }

  const forwarded = Boolean(raw.is_forwarded ?? raw.forwarded);
  const forwardedFrom = raw.forwarded_from?.username || raw.forwarded_from_username || raw.original_sender?.username;

  return {
    id: String(raw.id ?? raw.message_id),
    senderId: isOwn ? 'me' : senderId,
    content: type === 'text'
      ? (raw.content ?? raw.text ?? '')
      : resolveMedia(raw.media_url ?? raw.media ?? raw.content ?? ''),
    type,
    timestamp: parseDate(raw.created_at ?? raw.timestamp),
    isOneTimeView: Boolean(raw.is_one_time ?? raw.one_time),
    viewed: Boolean(raw.is_read ?? raw.read ?? raw.viewed),
    replyTo,
    forwarded,
    forwardedFrom,
  };
}

export function normalizeScribe(raw: any): Scribe {
  const user = normalizeUser(raw.user ?? raw);
  let type: Scribe['type'] = 'text';
  if (raw.content_type === 'code_scribe' || raw.code_html || raw.code_bundle) type = 'html';
  else if (raw.image_url || raw.media_url || raw.image) type = 'image';

  return {
    id: String(raw.id ?? raw.scribe_id),
    user,
    content: raw.content ?? raw.text ?? '',
    type,
    htmlContent:
      raw.code_bundle ??
      (raw.code_html
        ? `<style>${raw.code_css ?? ''}</style>${raw.code_html}<script>${raw.code_js ?? ''}</script>`
        : undefined),
    mediaUrl: resolveMedia(raw.image_url ?? raw.media_url ?? raw.image ?? '') || undefined,
    likes: Number(raw.likes ?? raw.like_count ?? 0),
    dislikes: Number(raw.dislikes ?? raw.dislike_count ?? 0),
    comments: Number(raw.comments_count ?? raw.comment_count ?? 0),
    reposts: Number(raw.reposts ?? raw.repost_count ?? 0),
    createdAt: parseDate(raw.created_at ?? raw.timestamp),
    isLiked: Boolean(raw.is_liked),
    isDisliked: Boolean(raw.is_disliked),
    isSaved: Boolean(raw.is_saved),
  };
}

export function normalizeOmzo(raw: any): Omzo {
  const user = normalizeUser({
    id: raw.user_id ?? raw.user?.id,
    username: raw.username ?? raw.user?.username,
    full_name: raw.full_name ?? raw.user?.full_name,
    user_avatar: raw.user_avatar ?? raw.user?.profile_picture_url,
    is_verified: raw.is_verified ?? raw.user?.is_verified,
    is_online: raw.user?.is_online,
  });
  return {
    id: String(raw.id ?? raw.omzo_id),
    user,
    videoUrl: resolveMedia(raw.video_url ?? raw.media_url ?? ''),
    caption: raw.caption ?? '',
    audioName: raw.audio_identifier || raw.audio_name || `Original Sound - ${user.username}`,
    likes: Number(raw.likes ?? 0),
    dislikes: Number(raw.dislikes ?? 0),
    shares: Number(raw.reposts ?? raw.shares ?? 0),
    createdAt: parseDate(raw.created_at),
    isLiked: Boolean(raw.is_liked),
    isDisliked: Boolean(raw.is_disliked),
    // Telemetry fields:
    impressionId: raw.impression_id,
    rankPosition: raw.rank_position,
    durationMs: raw.duration_ms,
    isSaved: Boolean(raw.is_saved),
    isFollowing: Boolean(raw.is_following),
  } as Omzo;
}

export function normalizeNotification(raw: any): Notification {
  const t = String(raw.type || raw.activity_type || 'like').toLowerCase();
  const type: Notification['type'] =
    t.includes('comment') ? 'comment'
    : t.includes('repost') ? 'repost'
    : t.includes('mention') ? 'mention'
    : t.includes('follow') || t.includes('connection') ? 'connection_request'
    : 'like';
  return {
    id: String(raw.id ?? raw.notification_id),
    type,
    user: normalizeUser(raw.actor ?? raw.user ?? raw.from_user ?? {}),
    content: raw.message ?? raw.description ?? raw.content ?? '',
    timestamp: parseDate(raw.created_at ?? raw.timestamp),
    read: Boolean(raw.read ?? raw.is_read),
  };
}
