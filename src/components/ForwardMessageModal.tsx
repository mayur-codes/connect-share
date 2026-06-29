import { motion, AnimatePresence } from 'framer-motion';
import { X, Forward, Loader2, Check } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Avatar } from './Avatar';
import { cn } from '@/lib/utils';
import * as chatApi from '@/services/chat';
import type { Message } from '@/services/api';
import { toast } from 'sonner';

interface ForwardMessageModalProps {
  open: boolean;
  onClose: () => void;
  message: Message | null;
}

export function ForwardMessageModal({ open, onClose, message }: ForwardMessageModalProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const chats = useQuery({ queryKey: ['chats'], queryFn: chatApi.listChats, enabled: open });

  const forwardMutation = useMutation({
    mutationFn: async () => {
      if (!message) return;
      const content = message.type === 'text' ? message.content : message.content;
      await Promise.all(
        selected.map((chatId) =>
          chatApi.sendMessage({ chatId, content, replyTo: undefined }).catch((e) => { throw e; })
        )
      );
    },
    onSuccess: () => {
      toast.success(`Forwarded to ${selected.length} chat${selected.length > 1 ? 's' : ''}`);
      setSelected([]);
      onClose();
    },
    onError: (e: any) => toast.error(e?.message || 'Failed to forward'),
  });

  const toggle = (id: string) =>
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  if (!open) return null;

  const preview =
    message?.type === 'text' ? message.content :
    message?.type === 'image' ? 'Photo' :
    message?.type === 'video' ? 'Video' : 'Attachment';

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
        onClick={onClose}>
        <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md glass-card rounded-2xl overflow-hidden max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Forward className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Forward message</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg"><X className="w-5 h-5" /></button>
          </div>

          <div className="px-4 py-3 border-b border-border bg-secondary/40">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Message</p>
            <p className="text-sm truncate">{preview}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {chats.isLoading && <div className="flex justify-center py-6"><Loader2 className="w-4 h-4 animate-spin" /></div>}
            {(chats.data ?? []).length === 0 && !chats.isLoading && (
              <p className="text-center text-muted-foreground text-sm py-6">No chats available</p>
            )}
            {(chats.data ?? []).map((c) => (
              <motion.button key={c.id} whileTap={{ scale: 0.98 }} onClick={() => toggle(c.id)}
                className={cn('w-full flex items-center gap-3 p-3 rounded-xl transition-colors',
                  selected.includes(c.id) ? 'bg-primary/20 border border-primary/50' : 'hover:bg-secondary')}>
                <Avatar src={c.user.avatar} alt={c.user.username} size="md" />
                <div className="flex-1 text-left min-w-0">
                  <p className="font-medium truncate">{c.user.displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">@{c.user.username}</p>
                </div>
                {selected.includes(c.id) && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>

          <div className="p-4 border-t border-border">
            <button disabled={selected.length === 0 || forwardMutation.isPending}
              onClick={() => forwardMutation.mutate()}
              className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-xl glow-primary disabled:opacity-50 flex items-center justify-center gap-2">
              {forwardMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Forward className="w-4 h-4" />}
              {selected.length === 0 ? 'Select chats to forward' : `Forward to ${selected.length}`}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
