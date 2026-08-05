import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

/**
 * User profile interface matching our database schema
 */
export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  updated_at: string;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  phone: string | null;
  role: string | null;
}

/**
 * Authentication context interface
 */
interface AuthContextType {
  // Auth state
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;

  // Loading states
  loading: boolean;
  profileLoading: boolean;

  // Computed properties
  isAuthenticated: boolean;
  isAdmin: boolean;
  isUser: boolean;

  // Auth methods
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string, phone?: string) => Promise<{ error: any; otpSent?: boolean; autoConfirmed?: boolean }>;
  signOut: () => Promise<void>;

  // Utility methods
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Custom hook to use authentication context
 * Throws error if used outside of AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Authentication provider component
 * Manages all authentication state and provides it to child components
 *
 * NOTE ON "HIDING" ROLE IN DEVTOOLS:
 * Removing role/email from console.log calls (done below) stops it from
 * showing up in the Console tab. It does NOT and cannot hide it from the
 * Network tab or React DevTools' component/state inspector — the browser
 * has to receive and hold this data to use it client-side. Treat any
 * client-side isAdmin/isUser check as a UI convenience only. Real
 * authorization must be enforced server-side (Supabase RLS policies,
 * SECURITY DEFINER functions, or edge functions that re-check role).
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Core auth state
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  /**
   * Fetches user profile from database
   * Uses security definer function to avoid RLS issues
   */
  const fetchProfile = async (userId: string): Promise<void> => {
    try {
      setProfileLoading(true);

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          created_at,
          updated_at,
          address_line_1,
          address_line_2,
          city,
          state,
          postal_code,
          phone,
          role
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile');
        setProfile(null);
        return;
      }

      setProfile(data as UserProfile);
    } catch (error) {
      console.error('Exception fetching profile');
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  /**
   * Refresh profile data
   */
  const refreshProfile = async (): Promise<void> => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  /**
   * Initialize authentication state
   * Sets up auth listener and gets initial session
   */
  useEffect(() => {
    let mounted = true;
    console.log('🔧 Initializing authentication system');

    /**
     * Handle auth state changes
     * CRITICAL: Keep this function synchronous to prevent deadlocks
     */
    const handleAuthChange = async (event: string, session: Session | null) => {
      if (!mounted) return;

      console.log('🔄 Auth state changed:', event, session ? 'user present' : 'no user');

      // Update session and user state immediately (synchronous)
      setSession(session);
      setUser(session?.user ?? null);

      // Handle profile fetching asynchronously
      if (session?.user) {
        // Use setTimeout to defer async operations and prevent deadlocks
        setTimeout(() => {
          if (mounted) {
            fetchProfile(session.user.id);
          }
        }, 0);
      } else {
        // Clear profile if no user
        setProfile(null);
        setProfileLoading(false);
      }

      // Auth initialization complete
      setLoading(false);
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Get initial session
    const initializeAuth = async () => {
      try {
        console.log('🚀 Getting initial session');
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error('❌ Error getting initial session');
          setLoading(false);
          return;
        }

        console.log('✅ Initial session retrieved:', session ? 'session found' : 'no session');

        // Trigger auth change handler with initial session
        await handleAuthChange('INITIAL_SESSION', session);
      } catch (error) {
        console.error('💥 Exception during auth initialization');
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up auth context');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔑 Attempting sign in');

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Sign in error');
        return { error };
      }

      console.log('✅ Sign in successful');
      return { error: null };
    } catch (error) {
      console.error('💥 Sign in exception');
      return { error };
    }
  };

  /**
   * Sign up with email, password, and optional full name.
   * Also reports back whether Supabase actually queued a confirmation/OTP
   * email, or whether the project auto-confirmed the user (no OTP step
   * possible until "Confirm email" is enabled in Supabase Auth settings).
   */
  const signUp = async (email: string, password: string, fullName?: string, phone?: string) => {
    try {
      console.log('📝 Attempting sign up');

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName || '',
            phone: phone || '',
          },
        },
      });

      if (error) {
        console.error('❌ Sign up error');
        return { error };
      }

      // Diagnostics: figure out whether an OTP/confirmation email was
      // actually sent, or whether Supabase logged the user straight in.
      const autoConfirmed = !!data.session;
      const otpSent = !!data.user?.confirmation_sent_at && !autoConfirmed;

      if (autoConfirmed) {
        console.warn(
          '⚠️ Sign up returned an active session immediately — "Confirm email" ' +
          'is OFF in Supabase Auth settings, so no OTP was required or sent. ' +
          'Enable Authentication → Sign In / Providers → Email → "Confirm email" ' +
          'to require OTP verification before login.'
        );
      } else if (otpSent) {
        console.log('✅ Confirmation/OTP email queued');
      } else {
        console.warn(
          '⚠️ Sign up succeeded but confirmation_sent_at is empty — no OTP email ' +
          'appears to have been queued. Check Supabase → Auth Logs and your SMTP settings.'
        );
      }

      console.log('✅ Sign up successful');
      return { error: null, otpSent, autoConfirmed };
    } catch (error) {
      console.error('💥 Sign up exception');
      return { error };
    }
  };

  /**
   * Sign out user and clear all state
   */
  const signOut = async (): Promise<void> => {
    try {
      console.log('🚪 Signing out user');

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('❌ Sign out error');
      }

      // Clear all state immediately
      setUser(null);
      setSession(null);
      setProfile(null);
      setLoading(false);
      setProfileLoading(false);

      console.log('✅ User signed out successfully');

      // Navigate to home page after successful sign out
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('💥 Sign out exception');
    }
  };

  // Computed properties
  const isAuthenticated = !!user && !!session;
  const isAdmin = profile?.role === 'admin';
  const isUser = profile?.role === 'user';

  const value: AuthContextType = {
    // State
    user,
    session,
    profile,
    loading,
    profileLoading,

    // Computed
    isAuthenticated,
    isAdmin,
    isUser,

    // Methods
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};