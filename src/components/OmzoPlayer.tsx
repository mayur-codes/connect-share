import { Avatar } from './Avatar';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Heart, ThumbsDown, MessageCircle, Repeat2, Share2, MoreVertical, Music2, Flag, EyeOff, UserX, Bookmark } from 'lucide-react';
import type { Omzo } from '@/services/api';
import { useState, useRef, useEffect } from 'react';
import * as omzoApi from '@/services/omzo';
import * as scribesApi from '@/services/scribes';
import { toast } from 'sonner';

interface OmzoPlayerProps {
  omzo: Omzo;
  isActive: boolean;
  onUserClick?: () => void;
  onShare?: () => void;
  onLikeToggle?: () => void;
  onNotInterested?: () => void;
  onHideCreator?: () => void;
  onReport?: () => void;
  onComment?: () => void;
}

export function OmzoPlayer({
  omzo, isActive, onUserClick, onShare, onLikeToggle,
  onNotInterested, onHideCreator, onReport,
}: OmzoPlayerProps) {
  const [liked, setLiked] = useState(omzo.isLiked);
  const [likes, setLikes] = useState(omzo.likes);
  const [isPaused, setIsPaused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive && !isPaused) videoRef.current.play().catch(() => {});
    else videoRef.current.pause();
  }, [isActive, isPaused]);

  const handleLike = () => {
    setLiked((v) => !v);
    setLikes((c) => c + (liked ? -1 : 1));
    onLikeToggle?.();
  };

  const formatCount = (count: number) => {
    if (count >= 1_000_000) return (count / 1_000_000).toFixed(1) + 'M';
    if (count >= 1_000) return (count / 1_000).toFixed(1) + 'K';
    return count.toString();
  };

  return (
    <div className="relative w-full h-full bg-background">
      <video ref={videoRef} src={omzo.videoUrl} className="w-full h-full object-contain bg-black"
        loop muted playsInline onClick={() => setIsPaused((v) => !v)} />

      {isPaused && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <div className="w-0 h-0 border-l-[30px] border-l-white border-y-[18px] border-y-transparent ml-2" />
          </div>
        </div>
      )}

      <div className="absolute inset-0 omzo-gradient pointer-events-none" />

      {/* Right side actions */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5">
        <motion.button whileTap={{ scale: 0.9 }} onClick={handleLike} className="flex flex-col items-center gap-1">
          <div className={cn('w-12 h-12 rounded-full glass-button flex items-center justify-center',
            liked && 'bg-destructive/20 border-destructive/50')}>
            <Heart className={cn('w-6 h-6', liked ? 'text-destructive fill-destructive' : 'text-white')} />
          </div>
          <span className="text-xs text-white font-medium">{formatCount(likes)}</span>
        </motion.button>

        <motion.button whileTap={{ scale: 0.9 }} onClick={onShare} className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full glass-button flex items-center justify-center">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs text-white font-medium">{formatCount(omzo.shares)}</span>
        </motion.button>
      </div>

      {/* Top right menu */}
      <div className="absolute top-4 right-4">
        <button onClick={() => setMenuOpen((v) => !v)} className="p-2 glass-button rounded-full">
          <MoreVertical className="w-5 h-5 text-white" />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 mt-2 w-48 glass-card rounded-xl overflow-hidden z-40">
              <button onClick={() => { setMenuOpen(false); onNotInterested?.(); }}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-foreground hover:bg-secondary">
                <EyeOff className="w-4 h-4" /> Not interested
              </button>
              <button onClick={() => { setMenuOpen(false); onHideCreator?.(); }}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-foreground hover:bg-secondary">
                <UserX className="w-4 h-4" /> Hide @{omzo.user.username}
              </button>
              <button onClick={() => { setMenuOpen(false); onReport?.(); }}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-destructive hover:bg-secondary">
                <Flag className="w-4 h-4" /> Report
              </button>
            </div>
          </>
        )}
      </div>

      {/* Bottom overlay */}
      <div className="absolute bottom-4 left-4 right-20">
        <div className="flex items-center gap-3 mb-3" onClick={onUserClick}>
          <Avatar src={omzo.user.avatar} alt={omzo.user.username} size="md" onClick={onUserClick} />
          <span className="font-semibold text-white cursor-pointer">@{omzo.user.username}</span>
        </div>
        <p className="text-white text-sm mb-2">{omzo.caption}</p>
        <div className="flex items-center gap-2">
          <Music2 className="w-4 h-4 text-white animate-pulse" />
          <span className="text-sm text-white/80 truncate">{omzo.audioName}</span>
        </div>
      </div>
    </div>
  );
}
