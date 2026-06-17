import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Repeat2, AtSign, UserPlus, Loader2 } from 'lucide-react';
import { Avatar } from './Avatar';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import * as notificationsApi from '@/services/notifications';

const notificationIcons = {
  like: Heart, comment: MessageCircle, repost: Repeat2, mention: AtSign, connection_request: UserPlus,
};
const notificationColors = {
  like: 'text-destructive bg-destructive/20',
  comment: 'text-primary bg-primary/20',
  repost: 'text-success bg-success/20',
  mention: 'text-accent bg-accent/20',
  connection_request: 'text-warning bg-warning/20',
};

export function NotificationDropdown() {
  const { notificationsOpen, toggleNotifications } = useAppStore();
  const token = useAuthStore((s) => s.token);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['activity'],
    queryFn: notificationsApi.getActivity,
    enabled: !!token && notificationsOpen,
  });
  const unreadCount = (data ?? []).filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button onClick={toggleNotifications}
        className="relative p-2 hover:bg-secondary rounded-xl transition-colors">
        <svg viewBox="0 0 24 24" className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {notificationsOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40" onClick={toggleNotifications} />
            <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-80 glass-card rounded-2xl overflow-hidden z-50 shadow-elevated">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {isLoading && <div className="flex justify-center py-6"><Loader2 className="w-4 h-4 animate-spin" /></div>}
                {isError && <p className="text-center text-destructive text-sm py-6">Could not load</p>}
                {(data ?? []).length === 0 && !isLoading && !isError && (
                  <p className="text-center text-muted-foreground text-sm py-6">No activity yet</p>
                )}
                {(data ?? []).map((n) => {
                  const Icon = notificationIcons[n.type];
                  return (
                    <motion.div key={n.id} whileHover={{ backgroundColor: 'hsl(var(--secondary) / 0.5)' }}
                      onClick={() => notificationsApi.markRead(n.id)}
                      className={cn('flex items-start gap-3 p-4 cursor-pointer', !n.read && 'bg-primary/5')}>
                      <Avatar src={n.user.avatar} alt={n.user.username} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-semibold">{n.user.username}</span>{' '}{n.content}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(n.timestamp, { addSuffix: true })}
                        </span>
                      </div>
                      <div className={cn('p-2 rounded-lg', notificationColors[n.type])}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
