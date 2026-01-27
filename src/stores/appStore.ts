import { create } from 'zustand';

interface AppState {
  isUploadModalOpen: boolean;
  uploadType: 'scribe' | 'omzo' | null;
  activeTab: 'all' | 'private';
  notificationsOpen: boolean;
  
  openUploadModal: (type: 'scribe' | 'omzo') => void;
  closeUploadModal: () => void;
  setActiveTab: (tab: 'all' | 'private') => void;
  toggleNotifications: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isUploadModalOpen: false,
  uploadType: null,
  activeTab: 'all',
  notificationsOpen: false,
  
  openUploadModal: (type) => set({ isUploadModalOpen: true, uploadType: type }),
  closeUploadModal: () => set({ isUploadModalOpen: false, uploadType: null }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleNotifications: () => set((state) => ({ notificationsOpen: !state.notificationsOpen })),
}));
