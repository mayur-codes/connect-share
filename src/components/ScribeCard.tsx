import { Avatar } from './Avatar';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  Heart, 
  ThumbsDown, 
  MessageCircle, 
  Repeat2, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  BadgeCheck
} from 'lucide-react';
import type { Scribe } from '@/services/api';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

interface ScribeCardProps {
  scribe: Scribe;
  onUserClick?: () => void;
}

export function ScribeCard({ scribe, onUserClick }: ScribeCardProps) {
  const [liked, setLiked] = useState(scribe.isLiked);
  const [disliked, setDisliked] = useState(scribe.isDisliked);
  const [saved, setSaved] = useState(scribe.isSaved);
  const [likes, setLikes] = useState(scribe.likes);
  const [dislikes, setDislikes] = useState(scribe.dislikes);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-4 mb-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onUserClick}>
          <Avatar
            src={scribe.user.avatar}
            alt={scribe.user.username}
            size="md"
          />
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-foreground">
                {scribe.user.displayName}
              </span>
              {scribe.user.isVerified && (
                <BadgeCheck className="w-4 h-4 text-primary fill-primary/20" />
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              @{scribe.user.username} · {formatDistanceToNow(scribe.createdAt, { addSuffix: false })}
            </span>
          </div>
        </div>
        <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
          <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="mb-3">
        {scribe.type === 'text' && (
          <p className="text-foreground">{scribe.content}</p>
        )}
        
        {scribe.type === 'image' && (
          <>
            <p className="text-foreground mb-3">{scribe.content}</p>
            <img
              src={scribe.mediaUrl}
              alt="Scribe media"
              className="rounded-xl w-full object-cover max-h-96"
            />
          </>
        )}
        
        {scribe.type === 'html' && (
          <>
            <p className="text-foreground mb-3">{scribe.content}</p>
            <div className="rounded-xl overflow-hidden border border-border">
              <iframe
                srcDoc={scribe.htmlContent}
                className="w-full h-52 bg-background"
                sandbox="allow-scripts"
                title="HTML Content"
              />
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleLike}
          className={cn(
            'flex items-center gap-1.5 text-sm transition-colors',
            liked ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'
          )}
        >
          <Heart className={cn('w-5 h-5', liked && 'fill-current')} />
          <span>{formatCount(likes)}</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleDislike}
          className={cn(
            'flex items-center gap-1.5 text-sm transition-colors',
            disliked ? 'text-primary' : 'text-muted-foreground hover:text-primary'
          )}
        >
          <ThumbsDown className={cn('w-5 h-5', disliked && 'fill-current')} />
          <span>{formatCount(dislikes)}</span>
        </motion.button>

        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span>{formatCount(scribe.comments)}</span>
        </button>

        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-success transition-colors">
          <Repeat2 className="w-5 h-5" />
          <span>{formatCount(scribe.reposts)}</span>
        </button>

        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors">
          <Share2 className="w-5 h-5" />
        </button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setSaved(!saved)}
          className={cn(
            'text-sm transition-colors',
            saved ? 'text-warning' : 'text-muted-foreground hover:text-warning'
          )}
        >
          <Bookmark className={cn('w-5 h-5', saved && 'fill-current')} />
        </motion.button>
      </div>
    </motion.div>
  );
}
