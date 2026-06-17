import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Copy, Check, Loader2 } from 'lucide-react';
import { Avatar } from './Avatar';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/services/apiClient';
import * as searchApi from '@/services/search';
import { toast } from 'sonner';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'omzo' | 'scribe';
  contentId?: string;
}

export function ShareModal({ isOpen, onClose, type, contentId }: ShareModalProps) {
  const [q, setQ] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const users = useQuery({
    queryKey: ['share-search', q],
    queryFn: () => searchApi.searchUsers(q),
    enabled: isOpen && q.trim().length > 0,
  });

  const send = useMutation({
    mutationFn: () => apiRequest('/api/share/send/', {
      method: 'POST',
      body: { recipient_ids: selectedUsers, content_type: type, content_id: contentId },
    }),
    onSuccess: () => { toast.success('Shared'); setSelectedUsers([]); onClose(); },
    onError: (e: any) => toast.error(e?.message || 'Could not share'),
  });

  const toggleUser = (id: string) =>
    setSelectedUsers((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/${type}/${contentId ?? ''}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
        onClick={onClose}>
        <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md glass-card rounded-2xl overflow-hidden max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Share {type === 'omzo' ? 'Omzo' : 'Scribe'}</h2>
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg"><X className="w-5 h-5" /></button>
          </div>

          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="text" placeholder="Search users..." value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {users.isLoading && <div className="flex justify-center py-6"><Loader2 className="w-4 h-4 animate-spin" /></div>}
            {q.trim() === '' && <p className="text-center text-muted-foreground text-sm py-6">Search for a user to share with</p>}
            {(users.data ?? []).map((user) => (
              <motion.button key={user.id} whileTap={{ scale: 0.98 }} onClick={() => toggleUser(user.id)}
                className={cn('w-full flex items-center gap-3 p-3 rounded-xl',
                  selectedUsers.includes(user.id) ? 'bg-primary/20 border border-primary/50' : 'bg-secondary')}>
                <Avatar src={user.avatar} alt={user.username} size="md" />
                <div className="flex-1 text-left">
                  <p className="font-medium">{user.displayName}</p>
                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                </div>
                {selectedUsers.includes(user.id) && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>

          <div className="p-4 border-t border-border space-y-3">
            <button onClick={copyLink}
              className="w-full flex items-center justify-center gap-2 py-3 bg-secondary hover:bg-secondary/80 rounded-xl">
              {copied ? (<><Check className="w-5 h-5 text-success" /><span className="font-medium text-success">Link Copied!</span></>)
                      : (<><Copy className="w-5 h-5 text-muted-foreground" /><span className="font-medium">Share Link</span></>)}
            </button>
            {selectedUsers.length > 0 && (
              <button disabled={send.isPending} onClick={() => send.mutate()}
                className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-xl glow-primary disabled:opacity-50">
                {send.isPending ? 'Sending...' : `Send to ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}`}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
