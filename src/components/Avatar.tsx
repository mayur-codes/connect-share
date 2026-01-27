import { cn } from '@/lib/utils';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  hasStory?: boolean;
  storyViewed?: boolean;
  isOnline?: boolean;
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  xs: 'w-8 h-8 rounded-lg',
  sm: 'w-10 h-10 rounded-lg',
  md: 'w-12 h-12 rounded-xl',
  lg: 'w-14 h-14 rounded-xl',
  xl: 'w-16 h-16 rounded-2xl',
};

const onlineDotSizes = {
  xs: 'w-2 h-2 right-0 bottom-0',
  sm: 'w-2.5 h-2.5 right-0 bottom-0',
  md: 'w-3 h-3 right-0.5 bottom-0.5',
  lg: 'w-3.5 h-3.5 right-0.5 bottom-0.5',
  xl: 'w-4 h-4 right-1 bottom-1',
};

export function Avatar({
  src,
  alt,
  size = 'md',
  hasStory = false,
  storyViewed = false,
  isOnline = false,
  className,
  onClick,
}: AvatarProps) {
  const content = (
    <div className={cn('relative', onClick && 'cursor-pointer')} onClick={onClick}>
      <img
        src={src}
        alt={alt}
        className={cn(
          sizeClasses[size],
          'object-cover transition-transform duration-200',
          onClick && 'hover:scale-105',
          className
        )}
      />
      {isOnline && (
        <span
          className={cn(
            'absolute bg-success rounded-full border-2 border-background',
            onlineDotSizes[size]
          )}
        />
      )}
    </div>
  );

  if (hasStory) {
    return (
      <div className={cn(
        'story-ring',
        storyViewed && 'opacity-50'
      )}>
        <div className="story-ring-inner">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
