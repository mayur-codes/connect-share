import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StoryItem } from '@/components/StoryItem';
import { StoryViewer } from '@/components/StoryViewer';
import { ChatItem } from '@/components/ChatItem';
import { mockStories, mockChats } from '@/services/api';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { useAppStore } from '@/stores/appStore';

type ChatTab = 'all' | 'private';

export default function HomePage() {
  const navigate = useNavigate();
  const [chatTab, setChatTab] = useState<ChatTab>('all');
  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);
  const { openUploadModal } = useAppStore();

  const filteredChats = mockChats.filter(chat => 
    chatTab === 'all' ? true : chat.isPrivate
  );

  const openStory = (index: number) => {
    setStoryIndex(index);
    setStoryViewerOpen(true);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Stories Section */}
      <section className="p-4 border-b border-border/50">
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
          {/* Add Story button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openUploadModal('story')}
            className="flex flex-col items-center gap-2 min-w-[72px]"
          >
            <div className="relative">
              <Avatar
                src="https://i.pravatar.cc/150?img=70"
                alt="Your story"
                size="lg"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
                <Plus className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
            <span className="text-xs text-muted-foreground">Your story</span>
          </motion.button>

          {/* Other stories */}
          {mockStories.map((story, index) => (
            <StoryItem
              key={story.id}
              story={story}
              onClick={() => openStory(index)}
            />
          ))}
        </div>
      </section>

      {/* Chat sub-tabs */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-lg z-10 border-b border-border/50">
        <div className="flex p-2 gap-2">
          {(['all', 'private'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setChatTab(tab)}
              className={cn(
                'flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all',
                chatTab === tab
                  ? 'bg-primary text-primary-foreground glow-primary'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              {tab === 'all' ? 'All Chats' : 'Private'}
            </button>
          ))}
        </div>
      </div>

      {/* Chat list */}
      <div className="p-2">
        {filteredChats.map((chat, index) => (
          <motion.div
            key={chat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <ChatItem
              chat={chat}
              onClick={() => navigate(`/chat/${chat.id}`)}
            />
          </motion.div>
        ))}
      </div>

      {/* Story Viewer */}
      {storyViewerOpen && (
        <StoryViewer
          stories={mockStories}
          initialIndex={storyIndex}
          onClose={() => setStoryViewerOpen(false)}
        />
      )}
    </div>
  );
}
