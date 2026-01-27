import { motion, AnimatePresence } from 'framer-motion';
import { X, Image, Video, Code, Type, Upload } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function UploadModal() {
  const { isUploadModalOpen, uploadType, closeUploadModal } = useAppStore();
  const [scribeType, setScribeType] = useState<'text' | 'image' | 'html'>('text');
  const [content, setContent] = useState('');

  if (!isUploadModalOpen) return null;

  const scribeTypes = [
    { id: 'text', label: 'Text', icon: Type },
    { id: 'image', label: 'Media', icon: Image },
    { id: 'html', label: 'HTML/CSS/JS', icon: Code },
  ] as const;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
        onClick={closeUploadModal}
      >
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg glass-card rounded-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">
              {uploadType === 'scribe' ? 'New Scribe' : 'New Omzo'}
            </h2>
            <button 
              onClick={closeUploadModal}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {uploadType === 'scribe' && (
              <>
                {/* Scribe type selector */}
                <div className="flex gap-2 mb-4">
                  {scribeTypes.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setScribeType(id)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                        scribeType === id
                          ? 'bg-primary text-primary-foreground glow-primary'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>

                {/* Text input */}
                <textarea
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-32 bg-secondary rounded-xl p-4 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />

                {/* Media/HTML upload area */}
                {scribeType !== 'text' && (
                  <div className="mt-4 border-2 border-dashed border-border rounded-xl p-8 text-center">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {scribeType === 'image' 
                        ? 'Drop images or videos here'
                        : 'Drop HTML/CSS/JS files here'
                      }
                    </p>
                  </div>
                )}
              </>
            )}

            {uploadType === 'omzo' && (
              <>
                {/* Video upload area */}
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center mb-4">
                  <Video className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-foreground font-medium mb-1">Upload vertical video</p>
                  <p className="text-sm text-muted-foreground">
                    Drag and drop or click to browse
                  </p>
                </div>

                {/* Caption */}
                <textarea
                  placeholder="Write a caption..."
                  className="w-full h-24 bg-secondary rounded-xl p-4 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border flex justify-end gap-3">
            <button
              onClick={closeUploadModal}
              className="px-6 py-2.5 rounded-xl text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              Cancel
            </button>
            <button
              className="px-6 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground glow-primary hover:opacity-90 transition-opacity"
            >
              Post
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
