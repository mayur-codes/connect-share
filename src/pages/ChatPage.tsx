import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Phone, 
  Video, 
  Info, 
  Image, 
  Share2, 
  Send,
  Lock,
  Eye
} from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { MessageBubble } from '@/components/MessageBubble';
import { mockChats, mockMessages } from '@/services/api';
import { cn } from '@/lib/utils';

export default function ChatPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isOneTimeView, setIsOneTimeView] = useState(false);

  const chat = mockChats.find(c => c.id === chatId);

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Chat not found</p>
      </div>
    );
  }

  const handleSend = () => {
    if (message.trim()) {
      console.log('Sending:', message, { oneTimeView: isOneTimeView });
      setMessage('');
      setIsOneTimeView(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top Bar */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-card border-b border-border/50 safe-top"
      >
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-secondary rounded-xl transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-foreground" />
            </button>
            
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate(`/profile/${chat.user.id}`)}
            >
              <Avatar
                src={chat.user.avatar}
                alt={chat.user.username}
                size="md"
                isOnline={chat.user.isOnline}
              />
              <div>
                <p className="font-semibold text-foreground">{chat.user.displayName}</p>
                <p className="text-xs text-muted-foreground">
                  {chat.user.isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-secondary rounded-xl transition-colors">
              <Video className="w-5 h-5 text-foreground" />
            </button>
            <button className="p-2 hover:bg-secondary rounded-xl transition-colors">
              <Phone className="w-5 h-5 text-foreground" />
            </button>
            <button className="p-2 hover:bg-secondary rounded-xl transition-colors">
              <Info className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {mockMessages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.senderId === 'me'}
          />
        ))}
      </div>

      {/* Message Input */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-card border-t border-border/50 p-3 safe-bottom"
      >
        <div className="flex items-end gap-2">
          {/* Media button */}
          <button className="p-2.5 hover:bg-secondary rounded-xl transition-colors">
            <Image className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* P2P Share button */}
          <button className="p-2.5 hover:bg-secondary rounded-xl transition-colors">
            <Share2 className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* One-time view toggle */}
          <button
            onClick={() => setIsOneTimeView(!isOneTimeView)}
            className={cn(
              'p-2.5 rounded-xl transition-all',
              isOneTimeView 
                ? 'bg-warning/20 text-warning' 
                : 'hover:bg-secondary text-muted-foreground'
            )}
          >
            {isOneTimeView ? <Lock className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>

          {/* Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="w-full py-3 px-4 bg-secondary rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Send button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={!message.trim()}
            className={cn(
              'p-3 rounded-xl transition-all',
              message.trim()
                ? 'glow-primary'
                : 'bg-secondary'
            )}
            style={message.trim() ? { background: 'var(--gradient-primary)' } : undefined}
          >
            {isOneTimeView ? (
              <Lock className={cn(
                'w-5 h-5',
                message.trim() ? 'text-primary-foreground' : 'text-muted-foreground'
              )} />
            ) : (
              <Send className={cn(
                'w-5 h-5',
                message.trim() ? 'text-primary-foreground' : 'text-muted-foreground'
              )} />
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
