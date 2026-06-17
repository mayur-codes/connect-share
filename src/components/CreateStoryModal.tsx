import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as storiesApi from '@/services/stories';
import { toast } from 'sonner';

interface Props { open: boolean; onClose: () => void; }

export function CreateStoryModal({ open, onClose }: Props) {
  const [media, setMedia] = useState<File | null>(null);
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState<'all' | 'close_friends'>('all');
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: async () => {
      const storyType: 'text' | 'image' | 'video' = media
        ? (media.type.startsWith('video') ? 'video' : 'image')
        : 'text';
      if (storyType === 'text' && !content.trim()) throw new Error('Add text or media');
      return storiesApi.createStory({ storyType, content, media: media ?? undefined, audience });
    },
    onSuccess: () => {
      toast.success('Story posted');
      queryClient.invalidateQueries({ queryKey: ['following-stories'] });
      setMedia(null); setContent(''); onClose();
    },
    onError: (e: any) => toast.error(e?.message || 'Failed to post'),
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
            <h2 className="text-lg font-semibold">Add to your story</h2>
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-4 space-y-3">
            <label className="block border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer">
              <input type="file" accept="image/*,video/*" className="hidden"
                onChange={(e) => setMedia(e.target.files?.[0] ?? null)} />
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{media ? media.name : 'Pick a photo or video'}</p>
            </label>
            <textarea placeholder="Add a caption..." value={content} onChange={(e) => setContent(e.target.value)}
              className="w-full h-20 bg-secondary rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary" />
            <div className="flex gap-2">
              {(['all', 'close_friends'] as const).map((a) => (
                <button key={a} onClick={() => setAudience(a)}
                  className={`flex-1 py-2 rounded-xl text-sm ${audience === a ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                  {a === 'all' ? 'Everyone' : 'Close friends'}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4 border-t border-border flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-secondary text-sm">Cancel</button>
            <button disabled={create.isPending} onClick={() => create.mutate()}
              className="px-6 py-2.5 rounded-xl text-sm bg-primary text-primary-foreground glow-primary disabled:opacity-50 flex items-center gap-2">
              {create.isPending && <Loader2 className="w-4 h-4 animate-spin" />}Share
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
