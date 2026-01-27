import { Avatar } from './Avatar';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  Heart, 
  ThumbsDown, 
  Share2, 
  MoreVertical,
  Music2,
  Flag
} from 'lucide-react';
import type { Omzo } from '@/services/api';
import { useState, useRef, useEffect } from 'react';

interface OmzoPlayerProps {
  omzo: Omzo;
  isActive: boolean;
  onUserClick?: () => void;
}

export function OmzoPlayer({ omzo, isActive, onUserClick }: OmzoPlayerProps) {
  const [liked, setLiked] = useState(omzo.isLiked);
  const [disliked, setDisliked] = useState(omzo.isDisliked);
  const [likes, setLikes] = useState(omzo.likes);
  const [dislikes, setDislikes] = useState(omzo.dislikes);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive && !isPaused) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isActive, isPaused]);

  const handleLike = () => {
    if (liked) {
      setLiked(false);
      setLikes(l => l - 1);
    } else {
      setLiked(true);
      setLikes(l => l + 1);
      if (disliked) {
        setDisliked(false);
        setDislikes(d => d - 1);
      }
    }
  };

  const handleDislike = () => {
    if (disliked) {
      setDisliked(false);
      setDislikes(d => d - 1);
    } else {
      setDisliked(true);
      setDislikes(d => d + 1);
      if (liked) {
        setLiked(false);
        setLikes(l => l - 1);
      }
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  const togglePlay = () => {
    setIsPaused(!isPaused);
  };

  return (
    <div className="relative w-full h-full bg-background">
      {/* Video */}
      <video
        ref={videoRef}
        src={omzo.videoUrl}
        className="w-full h-full object-cover"
        loop
        muted
        playsInline
        onClick={togglePlay}
      />

      {/* Pause indicator */}
      {isPaused && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <div className="w-0 h-0 border-l-[30px] border-l-white border-y-[18px] border-y-transparent ml-2" />
          </div>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 omzo-gradient pointer-events-none" />

      {/* Right side actions */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleLike}
          className="flex flex-col items-center gap-1"
        >
          <div className={cn(
            'w-12 h-12 rounded-full glass-button flex items-center justify-center',
            liked && 'bg-destructive/20 border-destructive/50'
          )}>
            <Heart className={cn(
              'w-6 h-6',
              liked ? 'text-destructive fill-destructive' : 'text-white'
            )} />
          </div>
          <span className="text-xs text-white font-medium">{formatCount(likes)}</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleDislike}
          className="flex flex-col items-center gap-1"
        >
          <div className={cn(
            'w-12 h-12 rounded-full glass-button flex items-center justify-center',
            disliked && 'bg-primary/20 border-primary/50'
          )}>
            <ThumbsDown className={cn(
              'w-6 h-6',
              disliked ? 'text-primary fill-primary' : 'text-white'
            )} />
          </div>
          <span className="text-xs text-white font-medium">{formatCount(dislikes)}</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-12 h-12 rounded-full glass-button flex items-center justify-center">
            <Flag className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs text-white font-medium">Report</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-12 h-12 rounded-full glass-button flex items-center justify-center">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs text-white font-medium">{formatCount(omzo.shares)}</span>
        </motion.button>
      </div>

      {/* Top right menu */}
      <button className="absolute top-4 right-4 p-2 glass-button rounded-full">
        <MoreVertical className="w-5 h-5 text-white" />
      </button>

      {/* Bottom overlay */}
      <div className="absolute bottom-4 left-4 right-20">
        <div className="flex items-center gap-3 mb-3" onClick={onUserClick}>
          <Avatar
            src={omzo.user.avatar}
            alt={omzo.user.username}
            size="md"
            onClick={onUserClick}
          />
          <span className="font-semibold text-white cursor-pointer">
            @{omzo.user.username}
          </span>
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
