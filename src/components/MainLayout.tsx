import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass, Play, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationDropdown } from './NotificationDropdown';
import { useAppStore } from '@/stores/appStore';
import { UploadModal } from './UploadModal';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/explore', icon: Compass, label: 'Explore' },
  { path: '/omzo', icon: Play, label: 'Omzo' },
];

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { openUploadModal } = useAppStore();
  
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
            <NotificationDropdown />
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
                onClick={() => openUploadModal('scribe')}
                className="w-12 h-12 rounded-2xl flex items-center justify-center glow-primary transition-all"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <Plus className="w-6 h-6 text-primary-foreground" />
              </motion.button>
            </div>
          </div>
        </motion.nav>
      )}

      {/* Upload modal */}
      <UploadModal />
    </div>
  );
}
