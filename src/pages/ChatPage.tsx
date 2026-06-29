import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Phone, Video, Info, Image as ImageIcon, Share2, Send, Lock, Eye, Loader2, X, CornerUpLeft,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Avatar } from '@/components/Avatar';
import { MessageBubble } from '@/components/MessageBubble';
import { ForwardMessageModal } from '@/components/ForwardMessageModal';
import { cn } from '@/lib/utils';
import * as chatApi from '@/services/chat';
import { connectChat } from '@/services/sockets';
import { normalizeMessage } from '@/services/normalize';
import { useAuthStore } from '@/stores/authStore';
import type { Message } from '@/services/api';
import { toast } from 'sonner';

export default function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const me = useAuthStore((s) => s.user);
  const [message, setMessage] = useState('');
  const [isOneTimeView, setIsOneTimeView] = useState(false);
  const [replyTarget, setReplyTarget] = useState<Message | null>(null);
  const [forwardTarget, setForwardTarget] = useState<Message | null>(null);
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatsQuery = useQuery({ queryKey: ['chats'], queryFn: chatApi.listChats });
  const chat = chatsQuery.data?.find((c) => c.id === chatId);

  const messagesQuery = useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => chatApi.getMessages(chatId!, me?.id ?? ''),
    enabled: !!chatId && !!me,
  });

  // Mark read on load.
  useEffect(() => {
    if (chatId) chatApi.markChatRead(chatId);
  }, [chatId]);

  // WebSocket for live messages.
  useEffect(() => {
    if (!chatId || !me) return;
    const handle = connectChat(chatId, (event) => {
      if (event?.type === 'message.new' && event.message) {
        const m = normalizeMessage(event.message, me.id);
        setLiveMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
      }
    });
    return () => handle.close();
  }, [chatId, me]);

  // Auto-scroll on new messages.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messagesQuery.data, liveMessages]);

  const sendMutation = useMutation({
    mutationFn: () => chatApi.sendMessage({
      chatId: chatId!, content: message.trim(), oneTime: isOneTimeView,
      replyTo: replyTarget?.id,
    }),
    onSuccess: () => {
      setMessage(''); setIsOneTimeView(false); setReplyTarget(null);
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to send'),
  });

  const acceptMutation = useMutation({
    mutationFn: () => chatApi.acceptDmRequest(chatId!),
    onSuccess: () => { toast.success('Request accepted'); queryClient.invalidateQueries({ queryKey: ['messages', chatId] }); },
  });
  const declineMutation = useMutation({
    mutationFn: () => chatApi.declineDmRequest(chatId!),
    onSuccess: () => { toast('Request declined'); navigate('/'); },
  });

  if (!chatId) return null;

  const messages = [...(messagesQuery.data?.messages ?? []), ...liveMessages];
  const isRequest = messagesQuery.data?.isRequest;

  const handleSend = () => {
    if (!message.trim() || sendMutation.isPending) return;
    sendMutation.mutate();
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      <motion.header
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="glass-card border-b border-border/50 safe-top"
      >
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-secondary rounded-xl">
              <ArrowLeft className="w-6 h-6 text-foreground" />
            </button>
            {chat && (
              <div className="flex items-center gap-3 cursor-pointer"
                onClick={() => navigate(`/profile/${chat.user.username}`)}>
                <Avatar src={chat.user.avatar} alt={chat.user.username} size="md" isOnline={chat.user.isOnline} />
                <div>
                  <p className="font-semibold text-foreground">{chat.user.displayName}</p>
                  <p className="text-xs text-muted-foreground">{chat.user.isOnline ? 'Online' : 'Offline'}</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-secondary rounded-xl"><Video className="w-5 h-5" /></button>
            <button className="p-2 hover:bg-secondary rounded-xl"><Phone className="w-5 h-5" /></button>
            <button className="p-2 hover:bg-secondary rounded-xl"><Info className="w-5 h-5" /></button>
          </div>
        </div>
      </motion.header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {isRequest && (
          <div className="glass-card rounded-xl p-3 mb-4">
            <p className="text-sm text-muted-foreground mb-3">This user wants to send you a message</p>
            <div className="flex gap-2">
              <button onClick={() => acceptMutation.mutate()} disabled={acceptMutation.isPending}
                className="flex-1 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg">Accept</button>
              <button onClick={() => declineMutation.mutate()} disabled={declineMutation.isPending}
                className="flex-1 py-2 bg-secondary text-sm font-medium rounded-lg">Block</button>
              <button onClick={() => declineMutation.mutate()} disabled={declineMutation.isPending}
                className="flex-1 py-2 bg-destructive/20 text-destructive text-sm font-medium rounded-lg">Report</button>
            </div>
          </div>
        )}

        {messagesQuery.isLoading && (
          <div className="flex justify-center py-8 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin" /></div>
        )}
        {messagesQuery.isError && (
          <p className="text-center text-destructive text-sm">Failed to load messages</p>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} isOwn={m.senderId === 'me'}
            onReply={setReplyTarget} onForward={setForwardTarget} />
        ))}
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="glass-card border-t border-border/50 p-3 safe-bottom"
      >
        {replyTarget && (
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl bg-secondary/60 border-l-2 border-primary"
          >
            <CornerUpLeft className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-primary">
                Replying to {replyTarget.senderId === 'me' ? 'yourself' : (chat?.user.username ?? 'user')}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {replyTarget.type === 'text' ? replyTarget.content
                  : replyTarget.type === 'image' ? 'Photo'
                  : replyTarget.type === 'video' ? 'Video' : 'Attachment'}
              </p>
            </div>
            <button onClick={() => setReplyTarget(null)} className="p-1 rounded-full hover:bg-secondary">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </motion.div>
        )}
        <div className="flex items-end gap-2">
          <button className="p-2.5 hover:bg-secondary rounded-xl"><ImageIcon className="w-5 h-5 text-muted-foreground" /></button>
          <button className="p-2.5 hover:bg-secondary rounded-xl"><Share2 className="w-5 h-5 text-muted-foreground" /></button>
          <button onClick={() => setIsOneTimeView(!isOneTimeView)}
            className={cn('p-2.5 rounded-xl',
              isOneTimeView ? 'bg-warning/20 text-warning' : 'hover:bg-secondary text-muted-foreground')}>
            {isOneTimeView ? <Lock className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          <div className="flex-1 relative">
            <input type="text" placeholder="Type a message..." value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="w-full py-3 px-4 bg-secondary rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleSend} disabled={!message.trim() || sendMutation.isPending}
            className={cn('p-3 rounded-xl', message.trim() ? 'glow-primary' : 'bg-secondary')}
            style={message.trim() ? { background: 'var(--gradient-primary)' } : undefined}>
            {sendMutation.isPending
              ? <Loader2 className="w-5 h-5 animate-spin text-primary-foreground" />
              : <Send className={cn('w-5 h-5', message.trim() ? 'text-primary-foreground' : 'text-muted-foreground')} />}
          </motion.button>
        </div>
      </motion.div>

      <ForwardMessageModal open={!!forwardTarget} onClose={() => setForwardTarget(null)} message={forwardTarget} />
    </div>
  );
}
