import { Avatar } from './Avatar';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { UserPlus, BadgeCheck } from 'lucide-react';
import type { User } from '@/services/api';
import { useState } from 'react';

interface UserCardProps {
  user: User;
  showFollowButton?: boolean;
  onClick?: () => void;
}

export function UserCard({ user, showFollowButton = true, onClick }: UserCardProps) {
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="glass-card rounded-2xl p-4 flex items-center justify-between gap-3"
    >
      <div 
        className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
        onClick={onClick}
      >
        <Avatar
          src={user.avatar}
          alt={user.username}
          size="lg"
          isOnline={user.isOnline}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-foreground truncate">
              {user.displayName}
            </span>
            {user.isVerified && (
              <BadgeCheck className="w-4 h-4 text-primary fill-primary/20 flex-shrink-0" />
            )}
          </div>
          <span className="text-sm text-muted-foreground truncate block">
            @{user.username}
          </span>
        </div>
      </div>

      {showFollowButton && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsFollowing(!isFollowing)}
          className={cn(
            'px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center gap-2',
            isFollowing 
              ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              : 'bg-primary text-primary-foreground glow-primary hover:opacity-90'
          )}
        >
          {!isFollowing && <UserPlus className="w-4 h-4" />}
          {isFollowing ? 'Following' : 'Follow'}
        </motion.button>
      )}
    </motion.div>
  );
}
