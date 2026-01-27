import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { ScribeCard } from '@/components/ScribeCard';
import { UserCard } from '@/components/UserCard';
import { mockScribes, mockUsers, api } from '@/services/api';
import type { User } from '@/services/api';

export default function ExplorePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearching(true);
      const results = await api.searchUsers(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  // Insert suggested users between scribes
  const feedWithSuggestions = mockScribes.flatMap((scribe, index) => {
    if (index === 1) {
      return [
        { type: 'suggestions' as const, id: 'suggestions' },
        { type: 'scribe' as const, data: scribe },
      ];
    }
    return [{ type: 'scribe' as const, data: scribe }];
  });

  return (
    <div className="max-w-2xl mx-auto px-4 pb-4">
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 py-4 bg-background/80 backdrop-blur-lg z-10"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users or scribes..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-12 pr-12 py-3.5 glass-card rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Search Results */}
      {isSearching && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3 mb-6"
        >
          <h3 className="text-sm font-medium text-muted-foreground px-1">
            Search Results
          </h3>
          {searchResults.length > 0 ? (
            searchResults.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onClick={() => navigate(`/profile/${user.id}`)}
              />
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No users found
            </p>
          )}
        </motion.div>
      )}

      {/* Scribes Feed */}
      {!isSearching && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {feedWithSuggestions.map((item, index) => {
            if (item.type === 'suggestions') {
              return (
                <motion.div
                  key="suggestions"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card rounded-2xl p-4"
                >
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Suggested for you
                  </h3>
                  <div className="space-y-3">
                    {mockUsers.slice(0, 3).map((user) => (
                      <UserCard
                        key={user.id}
                        user={user}
                        onClick={() => navigate(`/profile/${user.id}`)}
                      />
                    ))}
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={item.data.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ScribeCard
                  scribe={item.data}
                  onUserClick={() => navigate(`/profile/${item.data.user.id}`)}
                />
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
