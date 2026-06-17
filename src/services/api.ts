// Odnix API types + endpoint surface.
// Real network calls live in feature modules (auth, profile, scribes, omzo, stories, chat, search).
// This file aggregates and re-exports them.

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  isOnline: boolean;
  isVerified?: boolean;
}

export interface Story {
  id: string;
  user: User;
  content: string; // resolved media URL
  type: 'image' | 'video';
  createdAt: Date;
  viewed: boolean;
}

export interface Message {
  id: string;
  senderId: string; // 'me' for own messages, otherwise other user id
  content: string;
  type: 'text' | 'image' | 'video' | 'file';
  timestamp: Date;
  isOneTimeView?: boolean;
  viewed?: boolean;
}

export interface Chat {
  id: string;
  user: User;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  isPrivate: boolean;
  isNewRequest?: boolean;
}

export interface Scribe {
  id: string;
  user: User;
  content: string;
  type: 'text' | 'image' | 'video' | 'html';
  htmlContent?: string;
  mediaUrl?: string;
  likes: number;
  dislikes: number;
  comments: number;
  reposts: number;
  createdAt: Date;
  isLiked?: boolean;
  isDisliked?: boolean;
  isSaved?: boolean;
}

export interface Omzo {
  id: string;
  user: User;
  videoUrl: string;
  caption: string;
  audioName: string;
  likes: number;
  dislikes: number;
  shares: number;
  createdAt: Date;
  isLiked?: boolean;
  isDisliked?: boolean;
  isSaved?: boolean;
  isFollowing?: boolean;
  // Telemetry-only fields, set by the server on /api/omzo/batch/
  impressionId?: string;
  rankPosition?: number;
  durationMs?: number;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'repost' | 'mention' | 'connection_request';
  user: User;
  content: string;
  timestamp: Date;
  read: boolean;
}

// Re-export feature APIs as a single `api` namespace for convenience.
import * as auth from './auth';
import * as profile from './profile';
import * as scribes from './scribes';
import * as omzo from './omzo';
import * as stories from './stories';
import * as chat from './chat';
import * as search from './search';
import * as notifications from './notifications';

export const api = { auth, profile, scribes, omzo, stories, chat, search, notifications };
