import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Compass, Play, Plus, FileText, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationDropdown } from './NotificationDropdown';
import { useAppStore } from '@/stores/appStore';
import { UploadModal } from './UploadModal';
import { Avatar } from './Avatar';
import { useState } from 'react';

// Current user (mock)
const currentUser = {
  id: 'me',
  username: 'odnix_user',
  displayName: 'You',
  avatar: 'https://i.pravatar.cc/150?img=70',
  isOnline: true,
};

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/explore', icon: Compass, label: 'Explore' },
  { path: '/omzo', icon: Play, label: 'Omzo' },
];

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { openUploadModal } = useAppStore();
  const [showUploadChoice, setShowUploadChoice] = useState(false);
  
  // Hide nav on chat screen
  const isFullScreen = location.pathname.startsWith('/chat/') || location.pathname === '/omzo';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar - hidden on full screen pages */}
      {!isFullScreen && (
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-30 glass-card border-b border-border/50 safe-top"
        >
          <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold gradient-text">Odnix</h1>
            <div className="flex items-center gap-3">
              <NotificationDropdown />
              <button onClick={() => navigate('/profile/me')}>
                <Avatar
                  src={currentUser.avatar}
                  alt={currentUser.username}
                  size="sm"
                />
              </button>
            </div>
          </div>
        </motion.header>
      )}

      {/* Main content */}
      <main className={cn(
        'flex-1',
        !isFullScreen && 'pb-20'
      )}>
        <Outlet />
      </main>

      {/* Bottom navigation */}
      {!isFullScreen && (
        <motion.nav
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-0 left-0 right-0 z-30 glass-card border-t border-border/50 safe-bottom"
        >
          <div className="flex items-center justify-around px-4 py-2 max-w-2xl mx-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <motion.button
                  key={item.path}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    'relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <item.icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-2 w-1 h-1 rounded-full bg-primary"
                      style={{ boxShadow: '0 0 10px hsl(var(--primary))' }}
                    />
                  )}
                </motion.button>
              );
            })}
            
            {/* Upload button */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUploadChoice(!showUploadChoice)}
                className="w-12 h-12 rounded-2xl flex items-center justify-center glow-primary transition-all"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <Plus className={cn("w-6 h-6 text-primary-foreground transition-transform", showUploadChoice && "rotate-45")} />
              </motion.button>
              
              {/* Upload choice popup */}
              <AnimatePresence>
                {showUploadChoice && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className="absolute bottom-16 right-0 glass-card rounded-xl p-2 min-w-[140px] border border-border/50"
                  >
                    <button
                      onClick={() => {
                        openUploadModal('scribe');
                        setShowUploadChoice(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-secondary rounded-lg transition-colors"
                    >
                      <FileText className="w-5 h-5 text-primary" />
                      <span className="text-foreground font-medium">Scribe</span>
                    </button>
                    <button
                      onClick={() => {
                        openUploadModal('omzo');
                        setShowUploadChoice(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-secondary rounded-lg transition-colors"
                    >
                      <Video className="w-5 h-5 text-accent" />
                      <span className="text-foreground font-medium">Omzo</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.nav>
      )}

      {/* Upload modal */}
      <UploadModal />
    </div>
  );
}
