import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, X, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ScribeCard } from '@/components/ScribeCard';
import { UserCard } from '@/components/UserCard';
import * as scribesApi from '@/services/scribes';
import * as searchApi from '@/services/search';

export default function ExplorePage() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const explore = useQuery({ queryKey: ['explore-feed'], queryFn: () => scribesApi.exploreFeed(1, 20) });
  const search = useQuery({
    queryKey: ['global-search', q],
    queryFn: () => searchApi.globalSearch(q),
    enabled: q.trim().length > 0,
  });

  const isSearching = q.trim().length > 0;

  return (
    <div className="max-w-2xl mx-auto px-4 pb-4">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 py-4 bg-background/80 backdrop-blur-lg z-10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input type="text" placeholder="Search users, scribes, omzos..." value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-12 pr-12 py-3.5 glass-card rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary" />
          {q && (
            <button onClick={() => setQ('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary rounded-lg">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </motion.div>

      {isSearching ? (
        <div className="space-y-6">
          {search.isLoading && <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" /></div>}
          {search.isError && <p className="text-center text-destructive">Search failed</p>}
          {search.data && (
            <>
              {search.data.users.length > 0 && (
                <section>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">People</h3>
                  <div className="space-y-2">
                    {search.data.users.map((u) => (
                      <UserCard key={u.id} user={u} onClick={() => navigate(`/profile/${u.username}`)} />
                    ))}
                  </div>
                </section>
              )}
              {search.data.scribes.length > 0 && (
                <section>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">Scribes</h3>
                  <div className="space-y-3">
                    {search.data.scribes.map((s) => (
                      <ScribeCard key={s.id} scribe={s} onUserClick={() => navigate(`/profile/${s.user.username}`)} />
                    ))}
                  </div>
                </section>
              )}
              {search.data.hashtags.length > 0 && (
                <section>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">Hashtags</h3>
                  <div className="flex flex-wrap gap-2">
                    {search.data.hashtags.map((h) => (
                      <span key={h} className="px-3 py-1.5 rounded-full bg-secondary text-sm">#{h}</span>
                    ))}
                  </div>
                </section>
              )}
              {!search.data.users.length && !search.data.scribes.length && !search.data.hashtags.length && (
                <p className="text-center text-muted-foreground py-10">No results</p>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {explore.isLoading && <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" /></div>}
          {explore.isError && (
            <div className="text-center py-10">
              <p className="text-destructive">Could not load feed</p>
              <button onClick={() => explore.refetch()} className="mt-2 text-primary hover:underline text-sm">Retry</button>
            </div>
          )}
          {(explore.data ?? []).map((s) => (
            <ScribeCard key={s.id} scribe={s} onUserClick={() => navigate(`/profile/${s.user.username}`)} />
          ))}
        </div>
      )}
    </div>
  );
}
