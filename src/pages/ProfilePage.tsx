import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings, Grid3X3, Play, Bookmark } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { mockUsers, mockScribes, mockOmzos } from '@/services/api';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useThemeStore, Theme } from '@/stores/themeStore';

const themes: { id: Theme; name: string; preview: string }[] = [
  { id: 'dark', name: 'Dark', preview: 'bg-slate-900' },
  { id: 'amoled', name: 'AMOLED', preview: 'bg-black' },
  { id: 'dracula', name: 'Dracula', preview: 'bg-[#282a36]' },
  { id: 'nord', name: 'Nord', preview: 'bg-[#2e3440]' },
  { id: 'cyberpunk', name: 'Cyberpunk', preview: 'bg-purple-950' },
  { id: 'synthwave', name: 'Synthwave', preview: 'bg-violet-950' },
];

export default function ProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'scribes' | 'omzos' | 'saved'>('scribes');
  const [showSettings, setShowSettings] = useState(false);
  const { theme, setTheme } = useThemeStore();

  const user = mockUsers.find(u => u.id === userId) || mockUsers[0];
  const userScribes = mockScribes.filter(s => s.user.id === userId);
  const userOmzos = mockOmzos.filter(o => o.user.id === userId);

  return (
    <div className="max-w-2xl mx-auto pb-20">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="sticky top-0 z-10 glass-card border-b border-border/50"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-secondary rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <span className="font-semibold text-foreground">@{user.username}</span>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-secondary rounded-xl transition-colors"
          >
            <Settings className="w-6 h-6 text-foreground" />
          </button>
        </div>
      </motion.header>

      {/* Theme Settings Panel */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="glass-card border-b border-border/50 p-4"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Theme</h3>
          <div className="grid grid-cols-3 gap-2">
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-xl transition-all',
                  theme === t.id
                    ? 'bg-primary/20 border border-primary/50'
                    : 'bg-secondary hover:bg-secondary/80'
                )}
              >
                <div className={cn('w-4 h-4 rounded', t.preview)} />
                <span className="text-sm text-foreground">{t.name}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Profile Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 text-center"
      >
        <Avatar
          src={user.avatar}
          alt={user.username}
          size="xl"
          isOnline={user.isOnline}
          className="mx-auto mb-4"
        />
        <h1 className="text-xl font-bold text-foreground mb-1">
          {user.displayName}
        </h1>
        <p className="text-muted-foreground mb-4">@{user.username}</p>

        <div className="flex justify-center gap-8 mb-6">
          <div className="text-center">
            <p className="text-xl font-bold text-foreground">234</p>
            <p className="text-sm text-muted-foreground">Scribes</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-foreground">12.5K</p>
            <p className="text-sm text-muted-foreground">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-foreground">890</p>
            <p className="text-sm text-muted-foreground">Following</p>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <button className="px-8 py-2.5 rounded-xl font-medium text-sm bg-primary text-primary-foreground glow-primary hover:opacity-90 transition-opacity">
            Follow
          </button>
          <button className="px-8 py-2.5 rounded-xl font-medium text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
            Message
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {[
          { id: 'scribes', icon: Grid3X3, label: 'Scribes' },
          { id: 'omzos', icon: Play, label: 'Omzos' },
          { id: 'saved', icon: Bookmark, label: 'Saved' },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 transition-colors relative',
              activeTab === id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-sm font-medium">{label}</span>
            {activeTab === id && (
              <motion.div
                layoutId="profile-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                style={{ boxShadow: '0 0 10px hsl(var(--primary))' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-3 gap-1 p-1">
        {activeTab === 'scribes' && mockScribes.slice(0, 9).map((scribe, i) => (
          <motion.div
            key={scribe.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            className="aspect-square bg-secondary rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
          >
            {scribe.mediaUrl ? (
              <img src={scribe.mediaUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-2">
                <p className="text-xs text-muted-foreground line-clamp-4 text-center">
                  {scribe.content}
                </p>
              </div>
            )}
          </motion.div>
        ))}

        {activeTab === 'omzos' && mockOmzos.map((omzo, i) => (
          <motion.div
            key={omzo.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            className="aspect-square bg-secondary rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity relative"
          >
            <video src={omzo.videoUrl} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Play className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
          </motion.div>
        ))}

        {activeTab === 'saved' && (
          <div className="col-span-3 py-12 text-center text-muted-foreground">
            <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No saved items yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
