import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Check, CheckCheck, Lock } from 'lucide-react';
import type { Message } from '@/services/api';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const isMedia = message.type === 'image' || message.type === 'video';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        'flex mb-2',
        isOwn ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[75%] relative',
          isOwn ? 'message-sent' : 'message-received',
          isMedia ? 'p-1' : 'px-4 py-2'
        )}
      >
        {message.type === 'image' && (
          <img
            src={message.content}
            alt="Shared image"
            className="rounded-xl max-w-full h-auto"
          />
        )}
        
        {message.type === 'video' && (
          <video
            src={message.content}
            className="rounded-xl max-w-full"
            controls
          />
        )}
        
        {message.type === 'text' && (
          <p className={cn(
            'text-sm',
            isOwn ? 'text-primary-foreground' : 'text-foreground'
          )}>
            {message.content}
          </p>
        )}

        <div className={cn(
          'flex items-center gap-1 mt-1',
          isOwn ? 'justify-end' : 'justify-start',
          isMedia && 'px-2 pb-1'
        )}>
          {message.isOneTimeView && (
            <Lock className="w-3 h-3 text-muted-foreground" />
          )}
          <span className={cn(
            'text-[10px]',
            isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isOwn && (
            message.viewed 
              ? <CheckCheck className="w-3 h-3 text-primary-foreground/70" />
              : <Check className="w-3 h-3 text-primary-foreground/70" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
