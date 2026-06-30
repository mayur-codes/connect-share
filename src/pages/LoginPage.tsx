import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { login } from '@/services/auth';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

const schema = z.object({
  email: z.string().trim().email('Enter a valid email').max(255),
  password: z.string().min(1, 'Password is required').max(128),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) { setError(parsed.error.issues[0].message); return; }
    setLoading(true);
    try {
      const user = await login(parsed.data.email, parsed.data.password);
      const token = localStorage.getItem('odnix_auth_token') || '';
      setSession(token, user);
      toast.success(`Welcome back${user.displayName ? `, ${user.displayName}` : ''}`);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-md rounded-3xl p-8"
      >
        <h1 className="text-3xl font-bold gradient-text mb-1">Odnix</h1>
        <p className="text-muted-foreground mb-6">Sign in to your account</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 bg-secondary rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Password</label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 bg-secondary rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-medium text-primary-foreground glow-primary disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'var(--gradient-primary)' }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Sign in
          </button>
        </form>

        <p className="text-sm text-muted-foreground mt-6 text-center">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
}
