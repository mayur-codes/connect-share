import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Check, CheckCheck, Lock, CornerUpLeft, CornerUpRight, Image as ImageIcon, Film, FileText, Reply } from 'lucide-react';
import type { Message } from '@/services/api';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onReply?: (message: Message) => void;
}

function ReplyPreview({ reply, isOwn }: { reply: NonNullable<Message['replyTo']>; isOwn: boolean }) {
  const Icon = reply.type === 'image' ? ImageIcon : reply.type === 'video' ? Film : reply.type === 'file' ? FileText : null;
  const text = reply.type === 'text'
    ? reply.content
    : reply.type === 'image' ? 'Photo'
    : reply.type === 'video' ? 'Video'
    : 'Attachment';

  return (
    <div className={cn(
      'flex items-stretch gap-2 rounded-lg px-2 py-1.5 mb-1.5 max-w-full overflow-hidden',
      isOwn ? 'bg-primary-foreground/15' : 'bg-foreground/5',
    )}>
      <div className={cn('w-0.5 rounded-full', isOwn ? 'bg-primary-foreground/70' : 'bg-primary')} />
      {reply.type === 'image' && reply.content && (
        <img src={reply.content} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <p className={cn(
          'text-[11px] font-semibold truncate',
          isOwn ? 'text-primary-foreground/90' : 'text-primary',
        )}>
          {reply.senderName}
        </p>
        <p className={cn(
          'text-xs truncate flex items-center gap-1',
          isOwn ? 'text-primary-foreground/80' : 'text-muted-foreground',
        )}>
          {Icon && <Icon className="w-3 h-3 flex-shrink-0" />}
          <span className="truncate">{text || '...'}</span>
        </p>
      </div>
    </div>
  );
}

export function MessageBubble({ message, isOwn, onReply }: MessageBubbleProps) {
  const isMedia = message.type === 'image' || message.type === 'video';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn('group flex items-center gap-2 mb-2', isOwn ? 'justify-end' : 'justify-start')}
    >
      {isOwn && onReply && (
        <button
          onClick={() => onReply(message)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-secondary"
          aria-label="Reply"
        >
          <Reply className="w-4 h-4 text-muted-foreground" />
        </button>
      )}

      <div
        className={cn(
          'max-w-[75%] relative',
          isOwn ? 'message-sent' : 'message-received',
          isMedia && !message.replyTo && !message.forwarded ? 'p-1' : 'px-3 py-2',
        )}
      >
        {message.forwarded && (
          <div className={cn(
            'flex items-center gap-1 mb-1 text-[11px] italic',
            isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground',
          )}>
            <CornerUpRight className="w-3 h-3" />
            <span>Forwarded{message.forwardedFrom ? ` from ${message.forwardedFrom}` : ''}</span>
          </div>
        )}

        {message.replyTo && <ReplyPreview reply={message.replyTo} isOwn={isOwn} />}

        {message.type === 'image' && (
          <img src={message.content} alt="Shared" className="rounded-xl max-w-full h-auto" />
        )}
        {message.type === 'video' && (
          <video src={message.content} className="rounded-xl max-w-full" controls />
        )}
        {message.type === 'text' && (
          <p className={cn('text-sm whitespace-pre-wrap break-words', isOwn ? 'text-primary-foreground' : 'text-foreground')}>
            {message.content}
          </p>
        )}

        <div className={cn(
          'flex items-center gap-1 mt-1',
          isOwn ? 'justify-end' : 'justify-start',
          isMedia && 'px-1',
        )}>
          {message.isOneTimeView && (
            <Lock className={cn('w-3 h-3', isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground')} />
          )}
          <span className={cn('text-[10px]', isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isOwn && (
            message.viewed
              ? <CheckCheck className="w-3 h-3 text-primary-foreground/70" />
              : <Check className="w-3 h-3 text-primary-foreground/70" />
          )}
        </div>
      </div>

      {!isOwn && onReply && (
        <button
          onClick={() => onReply(message)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-secondary"
          aria-label="Reply"
        >
          <CornerUpLeft className="w-4 h-4 text-muted-foreground" />
        </button>
      )}
    </motion.div>
  );
}
