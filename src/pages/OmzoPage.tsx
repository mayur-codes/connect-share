import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, Loader2 } from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { OmzoPlayer } from '@/components/OmzoPlayer';
import { ShareModal } from '@/components/ShareModal';
import * as omzoApi from '@/services/omzo';
import type { Omzo } from '@/services/api';

function uuid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `s-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function OmzoPage() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>(uuid());
  const lastEventRef = useRef<{ id: string; t: number } | null>(null);

  const feed = useInfiniteQuery({
    queryKey: ['omzo-batch'],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => omzoApi.batch({
      sessionId: sessionIdRef.current, cursor: pageParam, limit: 10, networkClass: 'wifi',
    }),
    getNextPageParam: (last) => (last.hasMore ? last.nextCursor : undefined),
  });

  const items: Omzo[] = useMemo(
    () => (feed.data?.pages.flatMap((p) => p.items) ?? []).filter((o) => !hiddenIds.has(o.id) && !hiddenIds.has(`user:${o.user.id}`)),
    [feed.data, hiddenIds]
  );

  // Track scroll position to determine active card.
  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollTop / el.clientHeight);
      if (idx !== activeIndex && idx >= 0 && idx < items.length) {
        // Send exit for previous item
        const prev = items[activeIndex];
        if (prev && lastEventRef.current) {
          const watchMs = Math.min(Date.now() - lastEventRef.current.t, 120_000);
          omzoApi.trackView({
            omzoId: prev.id, impressionId: prev.impressionId, sessionId: sessionIdRef.current,
            eventType: 'exit', watchMs, durationMs: prev.durationMs,
          });
        }
        setActiveIndex(idx);
        // visible for new
        const cur = items[idx];
        if (cur) {
          omzoApi.trackView({
            omzoId: cur.id, impressionId: cur.impressionId, sessionId: sessionIdRef.current,
            eventType: 'visible', durationMs: cur.durationMs,
          });
          lastEventRef.current = { id: cur.id, t: Date.now() };
        }
        // Prefetch next page when nearing end
        if (idx >= items.length - 3) feed.fetchNextPage();
      }
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [activeIndex, items, feed]);

  // Initial visible event
  useEffect(() => {
    if (items.length > 0 && !lastEventRef.current) {
      const cur = items[0];
      omzoApi.trackView({
        omzoId: cur.id, impressionId: cur.impressionId, sessionId: sessionIdRef.current,
        eventType: 'visible', durationMs: cur.durationMs,
      });
      lastEventRef.current = { id: cur.id, t: Date.now() };
    }
  }, [items]);

  const handleNotInterested = (o: Omzo) => {
    omzoApi.trackView({
      omzoId: o.id, impressionId: o.impressionId, sessionId: sessionIdRef.current,
      eventType: 'not_interested',
    });
    setHiddenIds((prev) => new Set(prev).add(o.id));
  };
  const handleHideCreator = (o: Omzo) => {
    if (!window.confirm(`Hide all videos from @${o.user.username}?`)) return;
    omzoApi.trackView({
      omzoId: o.id, impressionId: o.impressionId, sessionId: sessionIdRef.current,
      eventType: 'hide_creator',
    });
    setHiddenIds((prev) => new Set(prev).add(`user:${o.user.id}`));
  };
  const handleReport = (o: Omzo) => {
    const reason = window.prompt('Report reason (spam/inappropriate/harassment/violence/hate_speech/false_info/copyright/other):', 'spam');
    if (!reason) return;
    omzoApi.reportOmzo(o.id, reason).catch(() => {});
  };

  return (
    <div className="min-h-[calc(100dvh-8rem)] w-full flex items-start justify-center px-2 sm:px-4 py-4">
      <div
        className="relative w-full max-w-[420px] bg-black rounded-3xl overflow-hidden shadow-2xl border border-border/40"
        style={{ aspectRatio: '9 / 16', maxHeight: 'calc(100dvh - 8rem)' }}
      >
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between">
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/')} className="p-2 glass-button rounded-full">
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/')} className="p-2 glass-button rounded-full">
            <Home className="w-5 h-5 text-white" />
          </motion.button>
        </div>

        {feed.isLoading && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}
        {feed.isError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3">
            <p>Could not load Omzos</p>
            <button onClick={() => feed.refetch()} className="px-4 py-2 bg-white/20 rounded-xl">Retry</button>
          </div>
        )}

        <div ref={containerRef} className="h-full w-full overflow-y-auto snap-y snap-mandatory hide-scrollbar">
          {items.map((omzo, index) => (
            <div key={omzo.id} className="h-full w-full snap-start snap-always">
              <OmzoPlayer
                omzo={omzo}
                isActive={index === activeIndex}
                onUserClick={() => navigate(`/profile/${omzo.user.username}`)}
                onShare={() => {
                  setShareOpen(true);
                  omzoApi.trackView({
                    omzoId: omzo.id, impressionId: omzo.impressionId, sessionId: sessionIdRef.current,
                    eventType: 'share',
                  });
                }}
                onNotInterested={() => handleNotInterested(omzo)}
                onHideCreator={() => handleHideCreator(omzo)}
                onReport={() => handleReport(omzo)}
                onLikeToggle={() => omzoApi.like(omzo.id).catch(() => {})}
              />
            </div>
          ))}
        </div>

        <ShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)} type="omzo"
          contentId={items[activeIndex]?.id} />
      </div>
    </div>
  );
}
