import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Heart, Send, MessageCircle, Repeat2 } from 'lucide-react';
import { Avatar } from './Avatar';
import type { Story } from '@/services/api';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
}

export function StoryViewer({ stories, initialIndex, onClose }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [reply, setReply] = useState('');
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [isPaused, setIsPaused] = useState(false);

  const currentStory = stories[currentIndex];

  useEffect(() => {
    if (isPaused) return;
    
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex(i => i + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return p + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentIndex, stories.length, onClose, isPaused]);

  const goNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(i => i + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
      setProgress(0);
    }
  };

  const handleReply = () => {
    if (reply.trim()) {
      console.log('Reply to story:', reply);
      setReply('');
    }
  };

  const toggleLike = () => {
    setLiked(prev => ({ ...prev, [currentStory.id]: !prev[currentStory.id] }));
  };

  const handleRepost = () => {
    console.log('Repost story:', currentStory.id);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black flex flex-col"
      >
        {/* Progress bars */}
        <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
          {stories.map((_, index) => (
            <div key={index} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: index < currentIndex ? '100%' : index === currentIndex ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-10 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Avatar
              src={currentStory.user.avatar}
              alt={currentStory.user.username}
              size="sm"
            />
            <div>
              <span className="text-white font-medium text-sm">
                {currentStory.user.username}
              </span>
              <span className="text-white/60 text-xs ml-2">
                {formatDistanceToNow(currentStory.createdAt, { addSuffix: true })}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Story content */}
        <div className="flex-1 relative">
          <motion.img
            key={currentStory.id}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            src={currentStory.content}
            alt="Story"
            className="w-full h-full object-cover"
          />

          {/* Navigation */}
          <button
            onClick={goPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1/3 h-1/2"
          >
            {currentIndex > 0 && (
              <ChevronLeft className="w-8 h-8 text-white/50 absolute left-4" />
            )}
          </button>
          <button
            onClick={goNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-1/2"
          >
            {currentIndex < stories.length - 1 && (
              <ChevronRight className="w-8 h-8 text-white/50 absolute right-4" />
            )}
          </button>
        </div>

        {/* Bottom actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          {/* Action buttons */}
          <div className="flex items-center justify-center gap-6 mb-4">
            <button
              onClick={toggleLike}
              className="flex flex-col items-center gap-1"
            >
              <Heart className={cn(
                "w-7 h-7",
                liked[currentStory.id] ? "text-red-500 fill-red-500" : "text-white"
              )} />
              <span className="text-white/70 text-xs">Like</span>
            </button>
            
            <button
              onClick={handleRepost}
              className="flex flex-col items-center gap-1"
            >
              <Repeat2 className="w-7 h-7 text-white" />
              <span className="text-white/70 text-xs">Repost</span>
            </button>
          </div>

          {/* Reply input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Reply to story..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onFocus={() => setIsPaused(true)}
              onBlur={() => setIsPaused(false)}
              onKeyDown={(e) => e.key === 'Enter' && handleReply()}
              className="flex-1 py-3 px-4 bg-white/10 backdrop-blur-sm rounded-full text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <button
              onClick={handleReply}
              disabled={!reply.trim()}
              className={cn(
                "p-3 rounded-full transition-colors",
                reply.trim() ? "bg-primary text-primary-foreground" : "bg-white/10 text-white/50"
              )}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
