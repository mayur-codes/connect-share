import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass, Play, Plus, ChevronUp, FileText, Video } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { NotificationDropdown } from './NotificationDropdown';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { UploadModal } from './UploadModal';
import { Avatar } from './Avatar';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/explore', icon: Compass, label: 'Explore' },
  { path: '/omzo', icon: Play, label: 'Omzo' },
];

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { openUploadModal } = useAppStore();
  const user = useAuthStore((s) => s.user);
  const [uploadMenuOpen, setUploadMenuOpen] = useState(false);

  const isFullScreen = location.pathname.startsWith('/chat/') || location.pathname === '/omzo';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!isFullScreen && (
        <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-30 glass-card border-b border-border/50 safe-top">
          <div className="flex items-center justify-between px-4 py-3 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold gradient-text cursor-pointer" onClick={() => navigate('/')}>Odnix</h1>
            <div className="flex items-center gap-2">
              <NotificationDropdown />
              {user && (
                <button onClick={() => navigate(`/profile/${user.username}`)} title="My profile">
                  <Avatar src={user.avatar} alt={user.username} size="sm" />
                </button>
              )}
            </div>
          </div>
        </motion.header>
      )}

      <main className={cn('flex-1', !isFullScreen && 'pb-20')}>
        <Outlet />
      </main>

      {!isFullScreen && (
        <motion.nav initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-0 left-0 right-0 z-30 glass-card border-t border-border/50 safe-bottom">
          <div className="flex items-center justify-around px-4 py-2 max-w-2xl mx-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <motion.button key={item.path} whileTap={{ scale: 0.9 }} onClick={() => navigate(item.path)}
                  className={cn('relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl',
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}>
                  <item.icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div layoutId="nav-indicator"
                      className="absolute -bottom-2 w-1 h-1 rounded-full bg-primary"
                      style={{ boxShadow: '0 0 10px hsl(var(--primary))' }} />
                  )}
                </motion.button>
              );
            })}

            <div className="relative">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={(e) => { e.stopPropagation(); setUploadMenuOpen((v) => !v); }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center glow-primary"
                style={{ background: 'var(--gradient-primary)' }}>
                {uploadMenuOpen ? <ChevronUp className="w-6 h-6 text-primary-foreground" /> : <Plus className="w-6 h-6 text-primary-foreground" />}
              </motion.button>
              {uploadMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setUploadMenuOpen(false)} />
                  <div className="absolute bottom-16 right-0 w-44 glass-card rounded-xl overflow-hidden z-40">
                    <button onClick={() => { setUploadMenuOpen(false); openUploadModal('scribe'); }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-secondary">
                      <FileText className="w-4 h-4" /> New Scribe
                    </button>
                    <button onClick={() => { setUploadMenuOpen(false); openUploadModal('omzo'); }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-secondary">
                      <Video className="w-4 h-4" /> New Omzo
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.nav>
      )}

      <UploadModal />
    </div>
  );
}
