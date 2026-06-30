import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, UserPlus } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { completeProfile } from '@/services/auth';
import { useAuthStore } from '@/stores/authStore';

const schema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be 30 characters or less')
    .regex(/^[a-zA-Z0-9_.]+$/, 'Only letters, numbers, "_" and "." allowed'),
  first_name: z.string().trim().min(1, 'First name is required').max(50),
  last_name: z.string().trim().min(1, 'Last name is required').max(50),
});

export function CompleteProfileModal() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [form, setForm] = useState({ username: '', first_name: '', last_name: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const open = Boolean(user?.profileCompletionRequired);

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse(form);
    if (!parsed.success) { setError(parsed.error.issues[0].message); return; }
    setLoading(true);
    try {
      const updated = await completeProfile(parsed.data);
      setUser(updated);
      toast.success('Profile completed');
    } catch (err: any) {
      setError(err?.message || 'Failed to complete profile');
    } finally { setLoading(false); }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm px-4"
          // Non-skippable: no onClick close, no escape handler
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="glass-card w-full max-w-md rounded-3xl p-7"
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center glow-primary"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <UserPlus className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Complete your profile</h2>
                <p className="text-xs text-muted-foreground">
                  Required to continue using Odnix
                </p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-3 mt-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Username</label>
                <input
                  placeholder="your_handle"
                  value={form.username}
                  onChange={(e) => update('username', e.target.value)}
                  className="w-full mt-1 bg-secondary rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">First name</label>
                  <input
                    placeholder="First"
                    value={form.first_name}
                    onChange={(e) => update('first_name', e.target.value)}
                    className="w-full mt-1 bg-secondary rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Last name</label>
                  <input
                    placeholder="Last"
                    value={form.last_name}
                    onChange={(e) => update('last_name', e.target.value)}
                    className="w-full mt-1 bg-secondary rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-medium text-primary-foreground glow-primary disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: 'var(--gradient-primary)' }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Continue
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
