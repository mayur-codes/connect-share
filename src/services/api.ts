// Mock API service layer - to be replaced with real API calls

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
  content: string;
  type: 'image' | 'video';
  createdAt: Date;
  viewed: boolean;
}

export interface Message {
  id: string;
  senderId: string;
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
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'repost' | 'mention' | 'connection_request';
  user: User;
  content: string;
  timestamp: Date;
  read: boolean;
}

// Mock data generators
export const mockUsers: User[] = [
  { id: '1', username: 'alex_tech', displayName: 'Alex Turner', avatar: 'https://i.pravatar.cc/150?img=1', isOnline: true, isVerified: true },
  { id: '2', username: 'sarah_designs', displayName: 'Sarah Chen', avatar: 'https://i.pravatar.cc/150?img=2', isOnline: true },
  { id: '3', username: 'mike_music', displayName: 'Mike Johnson', avatar: 'https://i.pravatar.cc/150?img=3', isOnline: false },
  { id: '4', username: 'emma_art', displayName: 'Emma Wilson', avatar: 'https://i.pravatar.cc/150?img=4', isOnline: true, isVerified: true },
  { id: '5', username: 'david_dev', displayName: 'David Park', avatar: 'https://i.pravatar.cc/150?img=5', isOnline: false },
  { id: '6', username: 'lisa_photo', displayName: 'Lisa Brown', avatar: 'https://i.pravatar.cc/150?img=6', isOnline: true },
  { id: '7', username: 'james_fit', displayName: 'James Miller', avatar: 'https://i.pravatar.cc/150?img=7', isOnline: false },
  { id: '8', username: 'nina_travel', displayName: 'Nina Garcia', avatar: 'https://i.pravatar.cc/150?img=8', isOnline: true },
];

export const mockStories: Story[] = mockUsers.slice(0, 6).map((user, i) => ({
  id: `story-${i}`,
  user,
  content: `https://picsum.photos/seed/${i}/400/600`,
  type: 'image',
  createdAt: new Date(Date.now() - i * 3600000),
  viewed: i > 2,
}));

export const mockChats: Chat[] = [
  { id: '1', user: mockUsers[0], lastMessage: 'Hey! Check out my new project 🚀', timestamp: new Date(Date.now() - 300000), unreadCount: 2, isPrivate: false },
  { id: '2', user: mockUsers[1], lastMessage: 'The design looks amazing!', timestamp: new Date(Date.now() - 900000), unreadCount: 0, isPrivate: true },
  { id: '3', user: mockUsers[2], lastMessage: 'Can we collaborate on this?', timestamp: new Date(Date.now() - 3600000), unreadCount: 1, isPrivate: false },
  { id: '4', user: mockUsers[3], lastMessage: 'Thanks for the feedback! 💜', timestamp: new Date(Date.now() - 7200000), unreadCount: 0, isPrivate: true },
  { id: '5', user: mockUsers[4], lastMessage: 'Let me know when you are free', timestamp: new Date(Date.now() - 14400000), unreadCount: 0, isPrivate: false, isNewRequest: true },
  { id: '6', user: mockUsers[5], lastMessage: 'Those photos are incredible', timestamp: new Date(Date.now() - 28800000), unreadCount: 0, isPrivate: false },
];

export const mockMessages: Message[] = [
  { id: '1', senderId: '1', content: 'Hey! How are you doing?', type: 'text', timestamp: new Date(Date.now() - 3600000) },
  { id: '2', senderId: 'me', content: 'I am great! Working on something cool', type: 'text', timestamp: new Date(Date.now() - 3500000) },
  { id: '3', senderId: '1', content: 'https://picsum.photos/seed/chat1/400/300', type: 'image', timestamp: new Date(Date.now() - 3400000) },
  { id: '4', senderId: 'me', content: 'Wow that looks amazing! 🔥', type: 'text', timestamp: new Date(Date.now() - 3300000) },
  { id: '5', senderId: '1', content: 'Thanks! I spent hours on it', type: 'text', timestamp: new Date(Date.now() - 3200000) },
  { id: '6', senderId: 'me', content: 'It really shows. The attention to detail is incredible', type: 'text', timestamp: new Date(Date.now() - 600000) },
  { id: '7', senderId: '1', content: 'Hey! Check out my new project 🚀', type: 'text', timestamp: new Date(Date.now() - 300000) },
];

export const mockScribes: Scribe[] = [
  {
    id: '1',
    user: mockUsers[0],
    content: 'Just shipped a new feature! The future of social is here. What do you all think? 🚀✨',
    type: 'text',
    likes: 234,
    dislikes: 5,
    comments: 45,
    reposts: 12,
    createdAt: new Date(Date.now() - 1800000),
  },
  {
    id: '2',
    user: mockUsers[1],
    content: 'New design exploration',
    type: 'image',
    mediaUrl: 'https://picsum.photos/seed/scribe1/600/400',
    likes: 567,
    dislikes: 8,
    comments: 89,
    reposts: 34,
    createdAt: new Date(Date.now() - 3600000),
    isLiked: true,
  },
  {
    id: '3',
    user: mockUsers[3],
    content: 'Interactive art piece',
    type: 'html',
    htmlContent: `
      <div style="width:100%;height:200px;background:linear-gradient(45deg,#ff006e,#8338ec,#3a86ff);display:flex;align-items:center;justify-content:center;">
        <h2 style="color:white;font-size:24px;font-weight:bold;text-shadow:0 2px 10px rgba(0,0,0,0.3);">Interactive Canvas</h2>
      </div>
    `,
    likes: 890,
    dislikes: 12,
    comments: 156,
    reposts: 67,
    createdAt: new Date(Date.now() - 7200000),
  },
  {
    id: '4',
    user: mockUsers[5],
    content: 'Golden hour magic ✨',
    type: 'image',
    mediaUrl: 'https://picsum.photos/seed/scribe2/600/800',
    likes: 1234,
    dislikes: 15,
    comments: 234,
    reposts: 89,
    createdAt: new Date(Date.now() - 14400000),
    isSaved: true,
  },
];

export const mockOmzos: Omzo[] = [
  {
    id: '1',
    user: mockUsers[0],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    caption: 'The future is now 🚀 #tech #innovation',
    audioName: 'Original Sound - alex_tech',
    likes: 12500,
    dislikes: 120,
    shares: 890,
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: '2',
    user: mockUsers[1],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    caption: 'Design process behind the scenes ✨ #design #creative',
    audioName: 'Trending Sound - Viral Mix',
    likes: 45000,
    dislikes: 230,
    shares: 2300,
    createdAt: new Date(Date.now() - 7200000),
    isLiked: true,
  },
  {
    id: '3',
    user: mockUsers[3],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    caption: 'Art in motion 🎨 #art #digital',
    audioName: 'Chill Vibes - Lo-Fi Beats',
    likes: 78000,
    dislikes: 450,
    shares: 5600,
    createdAt: new Date(Date.now() - 14400000),
  },
];

export const mockNotifications: Notification[] = [
  { id: '1', type: 'like', user: mockUsers[1], content: 'liked your scribe', timestamp: new Date(Date.now() - 300000), read: false },
  { id: '2', type: 'comment', user: mockUsers[2], content: 'commented: "This is amazing!"', timestamp: new Date(Date.now() - 900000), read: false },
  { id: '3', type: 'connection_request', user: mockUsers[4], content: 'wants to connect with you', timestamp: new Date(Date.now() - 1800000), read: false },
  { id: '4', type: 'repost', user: mockUsers[5], content: 'reposted your scribe', timestamp: new Date(Date.now() - 3600000), read: true },
  { id: '5', type: 'mention', user: mockUsers[6], content: 'mentioned you in a scribe', timestamp: new Date(Date.now() - 7200000), read: true },
];

// API functions (mocked)
export const api = {
  getStories: async (): Promise<Story[]> => {
    await new Promise(r => setTimeout(r, 500));
    return mockStories;
  },
  
  getChats: async (): Promise<Chat[]> => {
    await new Promise(r => setTimeout(r, 500));
    return mockChats;
  },
  
  getMessages: async (chatId: string): Promise<Message[]> => {
    await new Promise(r => setTimeout(r, 300));
    return mockMessages;
  },
  
  getScribes: async (): Promise<Scribe[]> => {
    await new Promise(r => setTimeout(r, 500));
    return mockScribes;
  },
  
  getOmzos: async (): Promise<Omzo[]> => {
    await new Promise(r => setTimeout(r, 500));
    return mockOmzos;
  },
  
  getNotifications: async (): Promise<Notification[]> => {
    await new Promise(r => setTimeout(r, 300));
    return mockNotifications;
  },
  
  searchUsers: async (query: string): Promise<User[]> => {
    await new Promise(r => setTimeout(r, 300));
    return mockUsers.filter(u => 
      u.username.toLowerCase().includes(query.toLowerCase()) ||
      u.displayName.toLowerCase().includes(query.toLowerCase())
    );
  },
};
