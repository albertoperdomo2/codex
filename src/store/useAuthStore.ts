// store/useAuthStore.ts
import { create } from 'zustand';
import { auth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: async (email: string, password: string) => {
    const { data, error } = await auth.signInWithEmail(email, password);
    if (error) throw error;
    
    if (data?.session?.user) {
      // Check if profile exists, if not create it
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select()
        .eq('id', data.session.user.id)
        .single();

      if (!existingProfile && data.session.user.email) {
        await supabase
          .from('profiles')
          .insert([{
            id: data.session.user.id,
            email: data.session.user.email,
            name: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
      }

      set({
        isAuthenticated: true,
        user: data.session.user,
      });
    }
  },
  logout: async () => {
    const { error } = await auth.signOut();
    if (error) throw error;
    set({ isAuthenticated: false, user: null });
  },
}));