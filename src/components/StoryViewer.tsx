import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Heart, Repeat2, Send, Loader2 } from 'lucide-react';
import { Avatar } from './Avatar';
import type { Story } from '@/services/api';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import * as storiesApi from '@/services/stories';
import { toast } from 'sonner';

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
}

export function StoryViewer({ stories, initialIndex, onClose }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [reply, setReply] = useState('');
  const [liked, setLiked] = useState(false);
  const [paused, setPaused] = useState(false);
  const [sending, setSending] = useState(false);

  const currentStory = stories[currentIndex];

  useEffect(() => {
    setProgress(0); setLiked(false); setReply('');
    if (currentStory) storiesApi.markViewed(currentStory.id);
  }, [currentIndex, currentStory]);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          if (currentIndex < stories.length - 1) { setCurrentIndex((i) => i + 1); return 0; }
          onClose(); return 100;
        }
        return p + 2;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [currentIndex, stories.length, onClose, paused]);

  const goNext = () => currentIndex < stories.length - 1 ? (setCurrentIndex(i => i + 1), setProgress(0)) : onClose();
  const goPrev = () => currentIndex > 0 && (setCurrentIndex(i => i - 1), setProgress(0));

  async function onLike() {
    setLiked((v) => !v);
    try { await storiesApi.toggleLike(currentStory.id); } catch { setLiked((v) => !v); }
  }
  async function onRepost() {
    try { await storiesApi.repostStory(currentStory.id); toast.success('Reposted'); }
    catch (e: any) { toast.error(e?.message || 'Could not repost'); }
  }
  async function onReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try { await storiesApi.addReply(currentStory.id, reply.trim()); setReply(''); toast.success('Reply sent'); }
    catch (e: any) { toast.error(e?.message || 'Failed'); }
    finally { setSending(false); }
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black">
        <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
          {stories.map((_, index) => (
            <div key={index} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <motion.div className="h-full bg-white rounded-full"
                animate={{ width: index < currentIndex ? '100%' : index === currentIndex ? `${progress}%` : '0%' }} />
            </div>
          ))}
        </div>

        <div className="absolute top-10 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Avatar src={currentStory.user.avatar} alt={currentStory.user.username} size="sm" />
            <div>
              <span className="text-white font-medium text-sm">{currentStory.user.username}</span>
              <span className="text-white/60 text-xs ml-2">{formatDistanceToNow(currentStory.createdAt, { addSuffix: true })}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2"><X className="w-6 h-6 text-white" /></button>
        </div>

        <motion.img key={currentStory.id} initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }}
          src={currentStory.content} alt="Story" className="w-full h-full object-cover" />

        <button onClick={goPrev} className="absolute left-0 top-1/2 -translate-y-1/2 w-1/3 h-1/2">
          {currentIndex > 0 && <ChevronLeft className="w-8 h-8 text-white/50 absolute left-4" />}
        </button>
        <button onClick={goNext} className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-1/2">
          {currentIndex < stories.length - 1 && <ChevronRight className="w-8 h-8 text-white/50 absolute right-4" />}
        </button>

        {/* Bottom reply bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent flex items-end gap-2 z-20"
             onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
          <form onSubmit={onReply} className="flex-1 flex items-center gap-2">
            <input value={reply} onChange={(e) => setReply(e.target.value)}
              placeholder={`Reply to ${currentStory.user.username}...`}
              onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
              className="flex-1 bg-white/10 backdrop-blur-md text-white placeholder:text-white/60 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white/40" />
            <button type="submit" disabled={!reply.trim() || sending}
              className="p-2.5 rounded-full bg-white/15 disabled:opacity-50">
              {sending ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Send className="w-5 h-5 text-white" />}
            </button>
          </form>
          <button onClick={onLike}
            className="p-2.5 rounded-full bg-white/15">
            <Heart className={`w-5 h-5 ${liked ? 'text-destructive fill-destructive' : 'text-white'}`} />
          </button>
          <button onClick={onRepost} className="p-2.5 rounded-full bg-white/15">
            <Repeat2 className="w-5 h-5 text-white" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
