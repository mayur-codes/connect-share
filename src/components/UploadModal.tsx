import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, Video, Code, Type, Upload, Loader2 } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as scribesApi from '@/services/scribes';
import * as omzoApi from '@/services/omzo';
import { toast } from 'sonner';

export function UploadModal() {
  const { isUploadModalOpen, uploadType, closeUploadModal } = useAppStore();
  const queryClient = useQueryClient();
  const [scribeType, setScribeType] = useState<'text' | 'image' | 'html'>('text');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [codeHtml, setCodeHtml] = useState('');
  const [codeCss, setCodeCss] = useState('');
  const [codeJs, setCodeJs] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');

  const reset = () => {
    setContent(''); setImageFile(null); setCodeHtml(''); setCodeCss(''); setCodeJs('');
    setVideoFile(null); setCaption(''); setScribeType('text');
  };

  const post = useMutation({
    mutationFn: async () => {
      if (uploadType === 'omzo') {
        if (!videoFile) throw new Error('Pick a video');
        return omzoApi.upload({ video: videoFile, caption });
      }
      if (scribeType === 'image') {
        if (!imageFile && !content.trim()) throw new Error('Add an image or text');
        return scribesApi.createScribe({ content, image: imageFile ?? undefined });
      }
      if (scribeType === 'html') {
        return scribesApi.createScribe({
          content, contentType: 'code_scribe',
          codeHtml, codeCss, codeJs,
        });
      }
      if (!content.trim()) throw new Error('Write something');
      return scribesApi.createScribe({ content });
    },
    onSuccess: () => {
      toast.success(uploadType === 'omzo' ? 'Omzo uploaded' : 'Scribe posted');
      queryClient.invalidateQueries({ queryKey: ['explore-feed'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      reset(); closeUploadModal();
    },
    onError: (e: any) => toast.error(e?.message || 'Upload failed'),
  });

  if (!isUploadModalOpen) return null;

  const scribeTypes = [
    { id: 'text', label: 'Text', icon: Type },
    { id: 'image', label: 'Media', icon: ImageIcon },
    { id: 'html', label: 'HTML/CSS/JS', icon: Code },
  ] as const;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
        onClick={closeUploadModal}>
        <motion.div initial={{ opacity: 0, y: 100, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 100, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg glass-card rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">{uploadType === 'scribe' ? 'New Scribe' : 'New Omzo'}</h2>
            <button onClick={closeUploadModal} className="p-2 hover:bg-secondary rounded-lg">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="p-4 max-h-[60vh] overflow-y-auto">
            {uploadType === 'scribe' && (
              <>
                <div className="flex gap-2 mb-4">
                  {scribeTypes.map(({ id, label, icon: Icon }) => (
                    <button key={id} onClick={() => setScribeType(id)}
                      className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium',
                        scribeType === id ? 'bg-primary text-primary-foreground glow-primary' : 'bg-secondary')}>
                      <Icon className="w-4 h-4" />{label}
                    </button>
                  ))}
                </div>

                <textarea placeholder="What's on your mind? (max 280)" maxLength={280}
                  value={content} onChange={(e) => setContent(e.target.value)}
                  className="w-full h-28 bg-secondary rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary" />

                {scribeType === 'image' && (
                  <label className="mt-4 block border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer">
                    <input type="file" accept="image/*,video/*" className="hidden"
                      onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">{imageFile ? imageFile.name : 'Click to upload an image or video'}</p>
                  </label>
                )}

                {scribeType === 'html' && (
                  <div className="mt-4 space-y-2">
                    <textarea placeholder="HTML" value={codeHtml} onChange={(e) => setCodeHtml(e.target.value)}
                      className="w-full h-20 bg-secondary rounded-xl p-3 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary" />
                    <textarea placeholder="CSS" value={codeCss} onChange={(e) => setCodeCss(e.target.value)}
                      className="w-full h-20 bg-secondary rounded-xl p-3 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary" />
                    <textarea placeholder="JS" value={codeJs} onChange={(e) => setCodeJs(e.target.value)}
                      className="w-full h-20 bg-secondary rounded-xl p-3 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                )}
              </>
            )}

            {uploadType === 'omzo' && (
              <>
                <label className="block border-2 border-dashed border-border rounded-xl p-8 text-center mb-4 cursor-pointer">
                  <input type="file" accept="video/*" className="hidden"
                    onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)} />
                  <Video className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium mb-1">{videoFile ? videoFile.name : 'Upload vertical video'}</p>
                  <p className="text-sm text-muted-foreground">Click to browse</p>
                </label>
                <textarea placeholder="Write a caption..." value={caption} maxLength={500}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full h-24 bg-secondary rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary" />
              </>
            )}
          </div>

          <div className="p-4 border-t border-border flex justify-end gap-3">
            <button onClick={closeUploadModal}
              className="px-6 py-2.5 rounded-xl text-sm font-medium bg-secondary">Cancel</button>
            <button onClick={() => post.mutate()} disabled={post.isPending}
              className="px-6 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground glow-primary disabled:opacity-50 flex items-center gap-2">
              {post.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Post
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
