import { Avatar } from './Avatar';
import type { Story } from '@/services/api';
import { motion } from 'framer-motion';

interface StoryItemProps {
  story: Story;
  onClick: () => void;
}

export function StoryItem({ story, onClick }: StoryItemProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center gap-2 min-w-[72px]"
    >
      <Avatar
        src={story.user.avatar}
        alt={story.user.username}
        size="lg"
        hasStory
        storyViewed={story.viewed}
      />
      <span className="text-xs text-muted-foreground truncate w-full text-center">
        {story.user.username}
      </span>
    </motion.button>
  );
}
