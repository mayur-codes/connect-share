import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { register, verifyEmailOtp } from '@/services/auth';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

const schema = z.object({
  username: z.string().trim().min(3).max(30),
  email: z.string().trim().email(),
  password: z.string().min(6).max(128),
  name: z.string().trim().min(1).max(50),
  lastname: z.string().trim().max(50).optional(),
});

export default function SignupPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [stage, setStage] = useState<'form' | 'otp'>('form');
  const [form, setForm] = useState({ username: '', email: '', password: '', name: '', lastname: '' });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(k: K, v: string) { setForm((p) => ({ ...p, [k]: v })); }

  async function onRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse(form);
    if (!parsed.success) { setError(parsed.error.issues[0].message); return; }
    setLoading(true);
    try {
      await register(parsed.data);
      setStage('otp');
      toast.success('OTP sent to ' + parsed.data.email);
    } catch (err: any) { setError(err?.message || 'Registration failed'); }
    finally { setLoading(false); }
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (otp.length < 4) { setError('Enter the OTP'); return; }
    setLoading(true);
    try {
      const user = await verifyEmailOtp(form.email, otp);
      const token = localStorage.getItem('odnix_auth_token') || '';
      setSession(token, user);
      toast.success('Account verified');
      navigate('/', { replace: true });
    } catch (err: any) { setError(err?.message || 'Verification failed'); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-md rounded-3xl p-8"
      >
        <h1 className="text-3xl font-bold gradient-text mb-1">Create account</h1>
        <p className="text-muted-foreground mb-6">
          {stage === 'form' ? 'Join Odnix in seconds' : `Verify the code sent to ${form.email}`}
        </p>

        {stage === 'form' ? (
          <form onSubmit={onRegister} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="First name" value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className="bg-secondary rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />
              <input placeholder="Last name" value={form.lastname}
                onChange={(e) => update('lastname', e.target.value)}
                className="bg-secondary rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <input placeholder="Username" value={form.username}
              onChange={(e) => update('username', e.target.value)}
              className="w-full bg-secondary rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />
            <input placeholder="Email" type="email" value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="w-full bg-secondary rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />
            <input placeholder="Password" type="password" value={form.password}
              onChange={(e) => update('password', e.target.value)}
              className="w-full bg-secondary rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-medium text-primary-foreground glow-primary disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'var(--gradient-primary)' }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Continue
            </button>
          </form>
        ) : (
          <form onSubmit={onVerify} className="space-y-3">
            <input placeholder="6-digit code" inputMode="numeric" value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full text-center tracking-[0.4em] text-xl bg-secondary rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-primary" />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-medium text-primary-foreground glow-primary disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'var(--gradient-primary)' }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Verify and sign in
            </button>
            <button type="button" onClick={() => setStage('form')}
              className="w-full py-2 text-sm text-muted-foreground hover:text-foreground">
              Back
            </button>
          </form>
        )}

        <p className="text-sm text-muted-foreground mt-6 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
