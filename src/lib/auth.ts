import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { create } from 'zustand';

let supabaseClient: SupabaseClient | null = null;

export const initializeSupabase = (url: string, anonKey: string) => {
  supabaseClient = createClient(url, anonKey);
  return supabaseClient;
};

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized. Call initializeSupabase first.');
  }
  return supabaseClient;
};

interface AuthState {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  error: null,

  initialize: async () => {
    set({ isInitializing: true, error: null });
    try {
      const supabase = getSupabaseClient();
      
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        set({ 
          isInitializing: false,
          isAuthenticated: false,
          user: null,
          error: error.message
        });
        return;
      }

      if (session?.user) {
        set({
          isInitializing: false,
          isAuthenticated: true,
          user: session.user,
          error: null
        });
      } else {
        set({
          isInitializing: false,
          isAuthenticated: false,
          user: null,
          error: null
        });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          set({
            isAuthenticated: true,
            user: session.user,
            error: null
          });
        } else if (event === 'SIGNED_OUT') {
          set({
            isAuthenticated: false,
            user: null,
            error: null
          });
        }
      });

    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ 
        isInitializing: false,
        error: error instanceof Error ? error.message : 'Initialization failed'
      });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        set({
          isLoading: false,
          error: error.message
        });
        return;
      }

      set({
        isLoading: false,
        isAuthenticated: true,
        user: data.user,
        error: null
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed'
      });
    }
  },

  signup: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        set({
          isLoading: false,
          error: error.message
        });
        return;
      }

      // Note: User might need to confirm email before being authenticated
      if (data.user && data.session) {
        set({
          isLoading: false,
          isAuthenticated: true,
          user: data.user,
          error: null
        });
      } else {
        set({
          isLoading: false,
          error: 'Please check your email to confirm your account'
        });
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Signup failed'
      });
    }
  },

  sendPasswordResetEmail: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        set({
          isLoading: false,
          error: error.message
        });
        return;
      }

      set({ 
        isLoading: false,
        error: null
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Password reset failed'
      });
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        set({
          isLoading: false,
          error: error.message
        });
        return;
      }

      set({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: null
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Logout failed'
      });
    }
  }
}));