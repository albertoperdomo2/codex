import { 
    AuthResponse, 
    User, 
    AuthError,
    OAuthResponse 
  } from '@supabase/supabase-js'
  import { supabase } from './supabase'
  
  export const auth = {
    // Email authentication
    signInWithEmail: async (email: string, password: string): Promise<AuthResponse> => {
      return supabase.auth.signInWithPassword({
        email,
        password,
      })
    },
  
    signUpWithEmail: async (email: string, password: string): Promise<AuthResponse> => {
      return supabase.auth.signUp({
        email,
        password,
      })
    },
  
    signInWithGoogle: async (): Promise<OAuthResponse> => {
      return supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
    },
  
    getSession: async () => {
      return supabase.auth.getSession()
    },
  
    getUser: async () => {
      return supabase.auth.getUser()
    },
  
    signOut: async () => {
      return supabase.auth.signOut()
    },
  
    onAuthStateChange: (callback: (event: 'SIGNED_IN' | 'SIGNED_OUT', session: User | null) => void) => {
      return supabase.auth.onAuthStateChange((event, session) => {
        callback(event as 'SIGNED_IN' | 'SIGNED_OUT', session?.user || null)
      })
    }
  }
  
  export const AUTH_ROUTES = {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    callback: '/auth/callback'
  } as const