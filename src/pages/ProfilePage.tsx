import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings, Grid3X3, Play, Bookmark, Pencil, Loader2, UserMinus, ShieldOff } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useThemeStore, Theme } from '@/stores/themeStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as profileApi from '@/services/profile';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { EditProfileModal } from '@/components/EditProfileModal';

const themes: { id: Theme; name: string; preview: string }[] = [
  { id: 'dark', name: 'Dark', preview: 'bg-slate-900' },
  { id: 'amoled', name: 'AMOLED', preview: 'bg-black' },
  { id: 'dracula', name: 'Dracula', preview: 'bg-[#282a36]' },
  { id: 'nord', name: 'Nord', preview: 'bg-[#2e3440]' },
  { id: 'cyberpunk', name: 'Cyberpunk', preview: 'bg-purple-950' },
  { id: 'synthwave', name: 'Synthwave', preview: 'bg-violet-950' },
];

export default function ProfilePage() {
  const { userId: username } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const me = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<'scribes' | 'omzos' | 'saved'>('scribes');
  const [showSettings, setShowSettings] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const { theme, setTheme } = useThemeStore();

  const targetUsername = username || me?.username || '';
  const isOwnProfile = !!me && targetUsername === me.username;

  const profile = useQuery({
    queryKey: ['profile', targetUsername],
    queryFn: () => profileApi.getProfile(targetUsername),
    enabled: !!targetUsername,
  });

  const followMutation = useMutation({
    mutationFn: () => profileApi.toggleFollow(targetUsername),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile', targetUsername] }),
    onError: (e: any) => toast.error(e?.message || 'Action failed'),
  });
  const blockMutation = useMutation({
    mutationFn: () => profileApi.toggleBlock(targetUsername),
    onSuccess: () => { toast.success('Updated'); queryClient.invalidateQueries({ queryKey: ['profile', targetUsername] }); },
  });

  if (profile.isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }
  if (profile.isError || !profile.data) {
    return <div className="p-10 text-center text-destructive">Could not load profile</div>;
  }

  const p = profile.data;

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="sticky top-0 z-10 glass-card border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-secondary rounded-xl">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="font-semibold">@{p.user.username}</span>
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 hover:bg-secondary rounded-xl">
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </motion.header>

      {showSettings && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="glass-card border-b border-border/50 p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Theme</h3>
          <div className="grid grid-cols-3 gap-2">
            {themes.map(t => (
              <button key={t.id} onClick={() => setTheme(t.id)}
                className={cn('flex items-center gap-2 p-3 rounded-xl',
                  theme === t.id ? 'bg-primary/20 border border-primary/50' : 'bg-secondary')}>
                <div className={cn('w-4 h-4 rounded', t.preview)} />
                <span className="text-sm">{t.name}</span>
              </button>
            ))}
          </div>
          {isOwnProfile && (
            <button onClick={async () => {
              await useAuthStore.getState().logout();
              navigate('/login', { replace: true });
            }} className="mt-4 w-full py-2.5 rounded-xl bg-destructive/20 text-destructive text-sm font-medium">
              Log out
            </button>
          )}
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 text-center">
        <Avatar src={p.user.avatar} alt={p.user.username} size="xl" isOnline={p.user.isOnline}
          className="mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-1">{p.user.displayName}</h1>
        <p className="text-muted-foreground mb-2">@{p.user.username}</p>
        {p.bio && <p className="text-sm text-foreground mb-4 max-w-md mx-auto">{p.bio}</p>}

        <div className="flex justify-center gap-8 mb-6">
          <div className="text-center"><p className="text-xl font-bold">{p.postCount}</p><p className="text-sm text-muted-foreground">Scribes</p></div>
          <div className="text-center"><p className="text-xl font-bold">{p.followerCount}</p><p className="text-sm text-muted-foreground">Followers</p></div>
          <div className="text-center"><p className="text-xl font-bold">{p.followingCount}</p><p className="text-sm text-muted-foreground">Following</p></div>
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          {isOwnProfile ? (
            <button onClick={() => setEditOpen(true)}
              className="px-8 py-2.5 rounded-xl font-medium text-sm bg-primary text-primary-foreground glow-primary flex items-center gap-2">
              <Pencil className="w-4 h-4" /> Edit profile
            </button>
          ) : (
            <>
              <button onClick={() => followMutation.mutate()} disabled={followMutation.isPending}
                className={cn('px-8 py-2.5 rounded-xl font-medium text-sm',
                  p.isFollowing ? 'bg-secondary' : 'bg-primary text-primary-foreground glow-primary')}>
                {p.isFollowing ? 'Following' : 'Follow'}
              </button>
              <button onClick={() => navigate(`/chat/new?user=${p.user.username}`)}
                className="px-8 py-2.5 rounded-xl font-medium text-sm bg-secondary">Message</button>
              <button onClick={() => blockMutation.mutate()} title={p.isBlocked ? 'Unblock' : 'Block'}
                className="p-2.5 rounded-xl bg-secondary">
                {p.isBlocked ? <ShieldOff className="w-4 h-4 text-destructive" /> : <UserMinus className="w-4 h-4 text-muted-foreground" />}
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {[
          { id: 'scribes', icon: Grid3X3, label: 'Scribes' },
          { id: 'omzos', icon: Play, label: 'Omzos' },
          { id: 'saved', icon: Bookmark, label: 'Saved' },
        ].map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setActiveTab(id as typeof activeTab)}
            className={cn('flex-1 flex items-center justify-center gap-2 py-3 relative',
              activeTab === id ? 'text-primary' : 'text-muted-foreground')}>
            <Icon className="w-5 h-5" /><span className="text-sm font-medium">{label}</span>
            {activeTab === id && (
              <motion.div layoutId="profile-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                style={{ boxShadow: '0 0 10px hsl(var(--primary))' }} />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'scribes' && (
        <div className="p-2 space-y-3">
          {p.scribes.length === 0 && <div className="p-10 text-center text-muted-foreground text-sm">No scribes yet</div>}
          {p.scribes.map((s) => (
            <div key={s.id} className="glass-card rounded-2xl p-4">
              <p className="text-foreground whitespace-pre-wrap">{s.content}</p>
              {s.mediaUrl && <img src={s.mediaUrl} alt="" className="mt-3 rounded-xl w-full" />}
            </div>
          ))}
        </div>
      )}
      {activeTab === 'omzos' && (
        <div className="grid grid-cols-3 gap-1 p-1">
          {p.omzos.length === 0 && <div className="col-span-3 p-10 text-center text-muted-foreground text-sm">No omzos yet</div>}
          {p.omzos.map((omzo, i) => (
            <motion.div key={omzo.id}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className="aspect-square bg-secondary rounded-lg overflow-hidden relative cursor-pointer">
              <video src={omzo.videoUrl} className="w-full h-full object-cover" muted />
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
      {activeTab === 'saved' && (
        <div className="py-12 text-center text-muted-foreground">
          <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No saved items yet</p>
        </div>
      )}

      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)}
        initial={{ displayName: p.user.displayName, username: p.user.username, bio: p.bio || '' }} />
    </div>
  );
}
