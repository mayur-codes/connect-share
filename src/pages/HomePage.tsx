import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StoryItem } from '@/components/StoryItem';
import { StoryViewer } from '@/components/StoryViewer';
import { ChatItem } from '@/components/ChatItem';
import { ScribeCard } from '@/components/ScribeCard';
import { mockStories, mockChats, mockScribes, mockOmzos } from '@/services/api';
import { cn } from '@/lib/utils';
import { Plus, MessageCircle, Grid3X3, Play } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { useAppStore } from '@/stores/appStore';
import { OmzoViewer } from '@/components/OmzoViewer';

type HomeTab = 'chats' | 'scribes' | 'omzos';
type ChatTab = 'all' | 'private';

export default function HomePage() {
  const navigate = useNavigate();
  const [homeTab, setHomeTab] = useState<HomeTab>('chats');
  const [chatTab, setChatTab] = useState<ChatTab>('all');
  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);
  const [omzoViewerOpen, setOmzoViewerOpen] = useState(false);
  const [omzoIndex, setOmzoIndex] = useState(0);
  const { openUploadModal } = useAppStore();

  const filteredChats = mockChats.filter(chat => 
    chatTab === 'all' ? true : chat.isPrivate
  );

  const openStory = (index: number) => {
    setStoryIndex(index);
    setStoryViewerOpen(true);
  };

  const openOmzo = (index: number) => {
    setOmzoIndex(index);
    setOmzoViewerOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto">
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

      {/* Home Tabs - Chats, Scribes, Omzos */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-lg z-10 border-b border-border/50">
        <div className="flex p-2 gap-2">
          {([
            { id: 'chats', label: 'Chats', icon: MessageCircle },
            { id: 'scribes', label: 'Scribes', icon: Grid3X3 },
            { id: 'omzos', label: 'Omzos', icon: Play },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setHomeTab(id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all',
                homeTab === id
                  ? 'bg-primary text-primary-foreground glow-primary'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content based on tab */}
      {homeTab === 'chats' && (
        <section className="flex-1">
          {/* Chat sub-tabs */}
          <div className="bg-background/80 backdrop-blur-lg border-b border-border/50">
            <div className="flex p-2 gap-2">
              {(['all', 'private'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setChatTab(tab)}
                  className={cn(
                    'flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all',
                    chatTab === tab
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab === 'all' ? 'All' : 'Private'}
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
                {/* New message request banner */}
                {chat.isNewRequest && (
                  <div className="glass-card rounded-xl p-3 mb-2 mx-1">
                    <p className="text-sm text-muted-foreground mb-3">
                      This user wants to send you a message
                    </p>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
                        Accept
                      </button>
                      <button className="flex-1 py-2 bg-secondary text-secondary-foreground text-sm font-medium rounded-lg hover:bg-secondary/80 transition-colors">
                        Block
                      </button>
                      <button className="flex-1 py-2 bg-destructive/20 text-destructive text-sm font-medium rounded-lg hover:bg-destructive/30 transition-colors">
                        Report
                      </button>
                    </div>
                  </div>
                )}
                <ChatItem
                  chat={chat}
                  onClick={() => navigate(`/chat/${chat.id}`)}
                />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {homeTab === 'scribes' && (
        <section className="p-4 space-y-4">
          {mockScribes.map((scribe, index) => (
            <motion.div
              key={scribe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ScribeCard scribe={scribe} />
            </motion.div>
          ))}
        </section>
      )}

      {homeTab === 'omzos' && (
        <section className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {mockOmzos.map((omzo, index) => (
              <motion.div
                key={omzo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => openOmzo(index)}
                className="aspect-[9/16] bg-secondary rounded-xl overflow-hidden cursor-pointer hover:opacity-80 transition-opacity relative group"
              >
                <video
                  src={omzo.videoUrl}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="flex items-center gap-2">
                    <Avatar src={omzo.user.avatar} alt={omzo.user.username} size="sm" />
                    <span className="text-white text-xs font-medium truncate">{omzo.user.username}</span>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-12 h-12 text-white drop-shadow-lg" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Story Viewer */}
      {storyViewerOpen && (
        <StoryViewer
          stories={mockStories}
          initialIndex={storyIndex}
          onClose={() => setStoryViewerOpen(false)}
        />
      )}

      {/* Omzo Viewer */}
      {omzoViewerOpen && (
        <OmzoViewer
          omzos={mockOmzos}
          initialIndex={omzoIndex}
          onClose={() => setOmzoViewerOpen(false)}
        />
      )}
    </div>
  );
}
