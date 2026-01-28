import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass, Play, Plus, FileText, Video, Flag, MoreVertical } from 'lucide-react';
import { OmzoPlayer } from '@/components/OmzoPlayer';
import { ShareModal } from '@/components/ShareModal';
import { mockOmzos } from '@/services/api';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { AnimatePresence } from 'framer-motion';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/explore', icon: Compass, label: 'Explore' },
  { path: '/omzo', icon: Play, label: 'Omzo' },
];

export default function OmzoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [showUploadChoice, setShowUploadChoice] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { openUploadModal } = useAppStore();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const height = container.clientHeight;
      const newIndex = Math.round(scrollTop / height);
      if (newIndex !== activeIndex && newIndex >= 0 && newIndex < mockOmzos.length) {
        setActiveIndex(newIndex);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [activeIndex]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Report button - top right */}
      <div className="absolute top-4 right-4 z-20 safe-top">
        <div className="relative">
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowReportMenu(!showReportMenu)}
            className="p-2 glass-button rounded-full"
          >
            <MoreVertical className="w-6 h-6 text-white" />
          </motion.button>
          
          <AnimatePresence>
            {showReportMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-12 right-0 glass-card rounded-xl p-2 min-w-[160px] border border-border/50"
              >
                <button
                  onClick={() => {
                    setShowReportMenu(false);
                    // Handle copyright report
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-secondary rounded-lg transition-colors"
                >
                  <Flag className="w-5 h-5 text-destructive" />
                  <span className="text-white font-medium">Copyright</span>
                </button>
                <button
                  onClick={() => {
                    setShowReportMenu(false);
                    // Handle report
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-secondary rounded-lg transition-colors"
                >
                  <Flag className="w-5 h-5 text-orange-500" />
                  <span className="text-white font-medium">Report</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Omzo Feed */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto snap-y snap-mandatory hide-scrollbar pb-20"
      >
        {mockOmzos.map((omzo, index) => (
          <div
            key={omzo.id}
            className="h-full snap-start snap-always"
          >
            <OmzoPlayer
              omzo={omzo}
              isActive={index === activeIndex}
              onUserClick={() => navigate(`/profile/${omzo.user.id}`)}
            />
          </div>
        ))}
      </div>

      {/* Bottom navigation */}
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
                    layoutId="omzo-nav-indicator"
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

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        type="omzo"
      />
    </div>
  );
}
