import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as profileApi from '@/services/profile';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  initial: { displayName: string; username: string; bio: string };
}

export function EditProfileModal({ open, onClose, initial }: Props) {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const me = useAuthStore((s) => s.user);
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [username, setUsername] = useState(initial.username);
  const [bio, setBio] = useState(initial.bio);
  const [avatar, setAvatar] = useState<File | null>(null);

  const save = useMutation({
    mutationFn: () => profileApi.updateProfile({
      displayName,
      username: username !== initial.username ? username : undefined,
      bio,
      avatar: avatar ?? undefined,
    }),
    onSuccess: () => {
      toast.success('Profile updated');
      if (me) setUser({ ...me, displayName, username });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setAvatar(null);
      onClose();
    },
    onError: (e: any) => toast.error(e?.message || 'Could not update'),
  });

  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
        onClick={onClose}>
        <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
          onClick={(e) => e.stopPropagation()} className="w-full max-w-md glass-card rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Edit profile</h2>
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-4 space-y-3">
            <label className="block border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer">
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => setAvatar(e.target.files?.[0] ?? null)} />
              <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
              <p className="text-sm text-muted-foreground">{avatar ? avatar.name : 'Change avatar'}</p>
            </label>
            <div>
              <label className="text-sm text-muted-foreground">Display name</label>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                className="w-full mt-1 bg-secondary rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Username</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full mt-1 bg-secondary rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={160}
                className="w-full mt-1 bg-secondary rounded-xl px-4 py-2.5 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          <div className="p-4 border-t border-border flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-secondary text-sm">Cancel</button>
            <button disabled={save.isPending} onClick={() => save.mutate()}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground glow-primary text-sm disabled:opacity-50 flex items-center gap-2">
              {save.isPending && <Loader2 className="w-4 h-4 animate-spin" />}Save
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
