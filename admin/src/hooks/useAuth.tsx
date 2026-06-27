import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Local-only opt-in for verifying the CRM without production credentials.
const DEV_MODE = import.meta.env.DEV && import.meta.env.VITE_DEV_ADMIN === 'true';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  isDevMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const isDevSession = import.meta.env.DEV && (
    import.meta.env.VITE_DEV_ADMIN === 'true' ||
    localStorage.getItem('dev_admin_session') === 'true'
  );

  const devUser = isDevSession ? {
    id: 'local-dev-admin',
    email: 'admin@urdigix.local',
  } as User : null;

  const [user, setUser] = useState<User | null>(devUser);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(isDevSession);
  const [isLoading, setIsLoading] = useState(!isDevSession);
  const [isDevMode, setIsDevMode] = useState(isDevSession);

  useEffect(() => {
    const isDevSession = localStorage.getItem('dev_admin_session') === 'true';
    if (import.meta.env.DEV && (DEV_MODE || isDevSession)) {
      const devUser = {
        id: 'local-dev-admin',
        email: 'admin@urdigix.local',
      } as User;

      setUser(devUser);
      setSession(null);
      setIsAdmin(true);
      setIsDevMode(true);
      setIsLoading(false);
      return;
    }

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Check admin role with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            checkAdminRole(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        checkAdminRole(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'admin'
      });

      if (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(data ?? false);
      }
    } catch (err) {
      console.error('Error checking admin role:', err);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (import.meta.env.DEV) {
      const cleanEmail = email.trim().toLowerCase();
      if ((cleanEmail === 'admin' || cleanEmail === 'admin@urdigix.local' || cleanEmail === 'admin@urdigix.com') && password === 'password') {
        const devUser = {
          id: 'local-dev-admin',
          email: 'admin@urdigix.local',
        } as User;
        
        setUser(devUser);
        setSession(null);
        setIsAdmin(true);
        setIsDevMode(true);
        setIsLoading(false);
        localStorage.setItem('dev_admin_session', 'true');
        return { error: null };
      }
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    // Clear dev session
    localStorage.removeItem('dev_admin_session');
    setIsDevMode(false);

    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, isLoading, isDevMode, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
