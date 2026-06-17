import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { setUnauthorizedHandler } from '@/services/apiClient';

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const { initialize, ready, logout } = useAuthStore();

  useEffect(() => {
    initialize();
    setUnauthorizedHandler(() => {
      useAuthStore.setState({ user: null, token: null });
    });
    return () => setUnauthorizedHandler(null);
  }, [initialize, logout]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return <>{children}</>;
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, ready } = useAuthStore();
  const location = useLocation();
  if (!ready) return null;
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
  return <>{children}</>;
}
