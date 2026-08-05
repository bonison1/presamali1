// src/pages/AuthCallback.tsx
// Google (and any future OAuth provider) redirects here after login.
// Supabase's client picks up the session from the URL automatically;
// we just wait for it and route the user onward.
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuthContext';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (isAuthenticated) {
      navigate(isAdmin ? '/admin' : '/customer-dashboard', { replace: true });
    } else {
      // Something went wrong finishing the OAuth handshake
      navigate('/auth?error=oauth_failed', { replace: true });
    }
  }, [isAuthenticated, isAdmin, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600 text-sm">Finishing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;