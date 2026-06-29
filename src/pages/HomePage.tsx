import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { StoryItem } from '@/components/StoryItem';
import { StoryViewer } from '@/components/StoryViewer';
import { ChatItem } from '@/components/ChatItem';
import { cn } from '@/lib/utils';
import { Plus, Loader2 } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import * as chatApi from '@/services/chat';
import * as storiesApi from '@/services/stories';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { CreateStoryModal } from '@/components/CreateStoryModal';
import type { Story } from '@/services/api';

type ChatTab = 'general' | 'private';

export default function HomePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<ChatTab>('general');
  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);
  const [createStoryOpen, setCreateStoryOpen] = useState(false);
  const { openUploadModal } = useAppStore();

  const chatsQuery = useQuery({ queryKey: ['chats'], queryFn: chatApi.listChats });
  const storiesQuery = useQuery({ queryKey: ['following-stories'], queryFn: storiesApi.followingStories });

  const allStories: Story[] = useMemo(
    () => (storiesQuery.data ?? []).flatMap((g) => g.stories),
    [storiesQuery.data]
  );

  const filteredChats = (chatsQuery.data ?? []).filter((c) => (activeTab === 'general' ? !c.isPrivate : c.isPrivate));

  const openStory = (index: number) => { setStoryIndex(index); setStoryViewerOpen(true); };

  return (
    <div className="max-w-6xl mx-auto lg:flex lg:gap-6 lg:px-6 lg:pt-4">
      <div className="flex-1 lg:max-w-2xl">
        {/* Stories */}
        <section className="p-4 border-b border-border/50">
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setCreateStoryOpen(true)}
              className="flex flex-col items-center gap-2 min-w-[72px]"
            >
              <div className="relative">
                <Avatar src={user?.avatar || 'https://i.pravatar.cc/150?img=70'} alt="Your story" size="lg" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
                  <Plus className="w-4 h-4 text-primary-foreground" />
                </div>
              </div>
              <span className="text-xs text-muted-foreground">Your story</span>
            </motion.button>

            {storiesQuery.isLoading && <div className="flex items-center text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /></div>}
            {storiesQuery.isError && <span className="text-xs text-destructive self-center">Failed to load stories</span>}
            {allStories.map((story, i) => (
              <StoryItem key={story.id} story={story} onClick={() => openStory(i)} />
            ))}
          </div>
        </section>

        {/* Chats */}
        <section>
          <div className="sticky top-0 bg-background/80 backdrop-blur-lg z-10 border-b border-border/50">
            <div className="flex p-2 gap-2">
              {(['all', 'private'] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={cn(
                    'flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all',
                    activeTab === tab
                      ? 'bg-primary text-primary-foreground glow-primary'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  {tab === 'all' ? 'All' : 'Private'}
                </button>
              ))}
            </div>
          </div>

          <div className="p-2">
            {chatsQuery.isLoading && (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            )}
            {chatsQuery.isError && (
              <div className="p-6 text-center">
                <p className="text-sm text-destructive">Could not load chats</p>
                <button onClick={() => chatsQuery.refetch()} className="mt-2 text-sm text-primary hover:underline">Retry</button>
              </div>
            )}
            {!chatsQuery.isLoading && !chatsQuery.isError && filteredChats.length === 0 && (
              <div className="p-10 text-center text-muted-foreground text-sm">No chats yet.</div>
            )}
            {filteredChats.map((chat, index) => (
              <motion.div key={chat.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}>
                <ChatItem chat={chat} onClick={() => navigate(`/chat/${chat.id}`)} />
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-80 shrink-0 sticky top-20 self-start space-y-4">
        <div className="glass-card rounded-2xl p-4">
          <h3 className="text-sm font-semibold mb-3">Quick actions</h3>
          <div className="space-y-2">
            <button onClick={() => openUploadModal('scribe')}
              className="w-full py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-sm">New Scribe</button>
            <button onClick={() => openUploadModal('omzo')}
              className="w-full py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-sm">New Omzo</button>
            <button onClick={() => setCreateStoryOpen(true)}
              className="w-full py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-sm">Add to story</button>
          </div>
        </div>
      </aside>

      {storyViewerOpen && allStories.length > 0 && (
        <StoryViewer stories={allStories} initialIndex={storyIndex} onClose={() => setStoryViewerOpen(false)} />
      )}
      <CreateStoryModal open={createStoryOpen} onClose={() => setCreateStoryOpen(false)} />
    </div>
  );
}
