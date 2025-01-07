import { useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { auth } from './lib/auth';
import type { User } from '@supabase/supabase-js';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './components/LoginPage';
import { SignUpPage } from './components/SignUpPage';
import { Dashboard } from './components/Dashboard';
import { supabase } from './lib/supabase';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    // Check for existing session
    auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select()
          .eq('id', session.user.id)
          .single();

        if (!existingProfile && session.user.email) {
          await supabase
            .from('profiles')
            .insert([{
              id: session.user.id,
              email: session.user.email,
              name: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }]);
        }

        useAuthStore.setState({ 
          isAuthenticated: true,
          user: session.user,
          isLoading: false
        });
      } else {
        useAuthStore.setState({ 
          isLoading: false 
        });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange((_event: 'SIGNED_IN' | 'SIGNED_OUT', user: User | null) => {
      if (user) {
        useAuthStore.setState({ 
          isAuthenticated: true,
          user,
          isLoading: false
        });
      } else {
        useAuthStore.setState({ 
          isAuthenticated: false,
          user: null,
          isLoading: false
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} 
          />
          <Route 
            path="/signup" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <SignUpPage />} 
          />
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;