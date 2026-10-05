import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isLiveSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch or create profile for authenticated user
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId);

      if (data && data.length > 0) {
        setProfile(data[0]);
      } else {
        // Fallback default profile creation if trigger didn't run
        const defaultProfile = {
          id: userId,
          full_name: user?.email ? user.email.split('@')[0] : 'Workspace Member',
          avatar_url: '',
          role: 'Member',
          bio: '',
          website: ''
        };
        setProfile(defaultProfile);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  useEffect(() => {
    // Initial session check
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Auth session error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen to Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Auth Operations
  const signUp = async (email, password, fullName) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });
      if (error) throw error;
      if (data?.user) {
        setUser(data.user);
        await fetchProfile(data.user.id);
      }
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      if (data?.user) {
        setUser(data.user);
        await fetchProfile(data.user.id);
      }
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error('Error logging out:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    if (!user) return { error: new Error('User not authenticated') };
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setProfile((prev) => ({ ...prev, ...updates }));
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const value = {
    user,
    profile,
    loading,
    isLiveSupabase: isLiveSupabaseConfigured,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refetchProfile: () => user && fetchProfile(user.id)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
