import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';
import { OmzoPlayer } from '@/components/OmzoPlayer';
import { ShareModal } from '@/components/ShareModal';
import { mockOmzos } from '@/services/api';

export default function OmzoPage() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
    <div className="fixed inset-0 bg-black">
      {/* Navigation buttons */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between safe-top">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/')}
          className="p-2 glass-button rounded-full"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/')}
          className="p-2 glass-button rounded-full"
        >
          <Home className="w-6 h-6 text-white" />
        </motion.button>
      </div>

      {/* Omzo Feed */}
      <div
        ref={containerRef}
        className="h-full overflow-y-auto snap-y snap-mandatory hide-scrollbar"
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

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        type="omzo"
      />
    </div>
  );
}
