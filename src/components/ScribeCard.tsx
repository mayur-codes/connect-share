import { Avatar } from './Avatar';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Heart, ThumbsDown, MessageCircle, Repeat2, Share2, Bookmark,
  MoreHorizontal, BadgeCheck, Loader2,
} from 'lucide-react';
import type { Scribe } from '@/services/api';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import * as scribesApi from '@/services/scribes';
import { ShareModal } from './ShareModal';
import { toast } from 'sonner';

interface ScribeCardProps {
  scribe: Scribe;
  onUserClick?: () => void;
  onCommentClick?: () => void;
}

export function ScribeCard({ scribe, onUserClick, onCommentClick }: ScribeCardProps) {
  const [liked, setLiked] = useState(!!scribe.isLiked);
  const [disliked, setDisliked] = useState(!!scribe.isDisliked);
  const [saved, setSaved] = useState(!!scribe.isSaved);
  const [likes, setLikes] = useState(scribe.likes);
  const [dislikes, setDislikes] = useState(scribe.dislikes);
  const [reposts, setReposts] = useState(scribe.reposts);
  const [reposted, setReposted] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const formatCount = (count: number) => {
    if (count >= 1_000_000) return (count / 1_000_000).toFixed(1) + 'M';
    if (count >= 1_000) return (count / 1_000).toFixed(1) + 'K';
    return count.toString();
  };

  const handleLike = async () => {
    const prev = { liked, disliked, likes, dislikes };
    const next = !liked;
    setLiked(next);
    setLikes((l) => l + (next ? 1 : -1));
    if (next && disliked) { setDisliked(false); setDislikes((d) => d - 1); }
    setBusy('like');
    try { await scribesApi.toggleLike(scribe.id); }
    catch (e: any) {
      setLiked(prev.liked); setDisliked(prev.disliked);
      setLikes(prev.likes); setDislikes(prev.dislikes);
      toast.error(e?.message || 'Could not like');
    } finally { setBusy(null); }
  };

  const handleDislike = async () => {
    const prev = { liked, disliked, likes, dislikes };
    const next = !disliked;
    setDisliked(next);
    setDislikes((d) => d + (next ? 1 : -1));
    if (next && liked) { setLiked(false); setLikes((l) => l - 1); }
    setBusy('dislike');
    try { await scribesApi.toggleDislike(scribe.id); }
    catch (e: any) {
      setLiked(prev.liked); setDisliked(prev.disliked);
      setLikes(prev.likes); setDislikes(prev.dislikes);
      toast.error(e?.message || 'Could not dislike');
    } finally { setBusy(null); }
  };

  const handleSave = async () => {
    const next = !saved;
    setSaved(next);
    setBusy('save');
    try {
      await scribesApi.toggleSave(scribe.id);
      toast.success(next ? 'Saved' : 'Removed from saved');
    } catch (e: any) {
      setSaved(!next);
      toast.error(e?.message || 'Could not save');
    } finally { setBusy(null); }
  };

  const handleRepost = async () => {
    if (reposted) return;
    setReposted(true); setReposts((r) => r + 1);
    setBusy('repost');
    try {
      await scribesApi.repost('scribe', scribe.id);
      toast.success('Reposted');
    } catch (e: any) {
      setReposted(false); setReposts((r) => r - 1);
      toast.error(e?.message || 'Could not repost');
    } finally { setBusy(null); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onUserClick}>
          <Avatar src={scribe.user.avatar} alt={scribe.user.username} size="md" />
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-foreground">{scribe.user.displayName}</span>
              {scribe.user.isVerified && <BadgeCheck className="w-4 h-4 text-primary fill-primary/20" />}
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
        {scribe.type === 'text' && <p className="text-foreground whitespace-pre-wrap">{scribe.content}</p>}
        {scribe.type === 'image' && (
          <>
            {scribe.content && <p className="text-foreground mb-3 whitespace-pre-wrap">{scribe.content}</p>}
            <img src={scribe.mediaUrl} alt="Scribe media" className="rounded-xl w-full object-cover max-h-96" />
          </>
        )}
        {scribe.type === 'html' && (
          <>
            {scribe.content && <p className="text-foreground mb-3 whitespace-pre-wrap">{scribe.content}</p>}
            <div className="rounded-xl overflow-hidden border border-border">
              <iframe srcDoc={scribe.htmlContent} className="w-full h-52 bg-background"
                sandbox="allow-scripts" title="HTML Content" />
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <motion.button whileTap={{ scale: 0.9 }} onClick={handleLike} disabled={busy === 'like'}
          className={cn('flex items-center gap-1.5 text-sm transition-colors',
            liked ? 'text-destructive' : 'text-muted-foreground hover:text-destructive')}>
          <Heart className={cn('w-5 h-5', liked && 'fill-current')} />
          <span>{formatCount(likes)}</span>
        </motion.button>

        <motion.button whileTap={{ scale: 0.9 }} onClick={handleDislike} disabled={busy === 'dislike'}
          className={cn('flex items-center gap-1.5 text-sm transition-colors',
            disliked ? 'text-primary' : 'text-muted-foreground hover:text-primary')}>
          <ThumbsDown className={cn('w-5 h-5', disliked && 'fill-current')} />
          <span>{formatCount(dislikes)}</span>
        </motion.button>

        <button onClick={() => (onCommentClick ? onCommentClick() : toast('Comments coming soon'))}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span>{formatCount(scribe.comments)}</span>
        </button>

        <motion.button whileTap={{ scale: 0.9 }} onClick={handleRepost} disabled={busy === 'repost' || reposted}
          className={cn('flex items-center gap-1.5 text-sm transition-colors',
            reposted ? 'text-success' : 'text-muted-foreground hover:text-success')}>
          <Repeat2 className="w-5 h-5" />
          <span>{formatCount(reposts)}</span>
        </motion.button>

        <button onClick={() => setShareOpen(true)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors">
          <Share2 className="w-5 h-5" />
        </button>

        <motion.button whileTap={{ scale: 0.9 }} onClick={handleSave} disabled={busy === 'save'}
          className={cn('text-sm transition-colors',
            saved ? 'text-warning' : 'text-muted-foreground hover:text-warning')}>
          {busy === 'save'
            ? <Loader2 className="w-5 h-5 animate-spin" />
            : <Bookmark className={cn('w-5 h-5', saved && 'fill-current')} />}
        </motion.button>
      </div>

      <ShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)} type="scribe" contentId={scribe.id} />
    </motion.div>
  );
}
