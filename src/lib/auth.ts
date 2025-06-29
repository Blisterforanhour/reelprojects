import { create } from 'zustand';

// Mock Supabase client
let supabaseClient: any = null;

export const initializeSupabase = (url: string, anonKey: string) => {
  supabaseClient = {
    auth: {
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        // Mock authentication
        return {
          data: {
            user: { id: '1', email },
            session: { access_token: 'mock-token' }
          },
          error: null
        };
      },
      signUp: async ({ email, password }: { email: string; password: string }) => {
        return {
          data: {
            user: { id: '1', email },
            session: { access_token: 'mock-token' }
          },
          error: null
        };
      },
      resetPasswordForEmail: async (email: string) => {
        return { data: {}, error: null };
      },
      getSession: async () => {
        return {
          data: { session: { access_token: 'mock-token' } },
          error: null
        };
      },
      onAuthStateChange: (callback: any) => {
        // Mock auth state change
        setTimeout(() => {
          callback('SIGNED_IN', { access_token: 'mock-token' });
        }, 100);
        return { data: { subscription: { unsubscribe: () => {} } } };
      }
    },
    functions: {
      invoke: async (functionName: string, options: any) => {
        // Mock function invocation
        return {
          data: {
            rating: Math.floor(Math.random() * 5) + 1,
            feedback: `Mock feedback for ${functionName}`
          },
          error: null
        };
      }
    }
  };
};

export const getSupabaseClient = () => supabaseClient;

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
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  error: null,

  initialize: async () => {
    set({ isInitializing: true });
    try {
      // Mock initialization
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ 
        isInitializing: false,
        isAuthenticated: true,
        user: { id: '1', email: 'demo@example.com' }
      });
    } catch (error) {
      set({ 
        isInitializing: false,
        error: error instanceof Error ? error.message : 'Initialization failed'
      });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({
        isLoading: false,
        isAuthenticated: true,
        user: { id: '1', email }
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({
        isLoading: false,
        isAuthenticated: true,
        user: { id: '1', email }
      });
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Password reset failed'
      });
    }
  }
}));