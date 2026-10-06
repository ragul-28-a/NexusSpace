import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isLiveSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext(null);

const resolveFallbackProfile = (currentUser) => {
  const email = currentUser?.email || '';
  const fullName = currentUser?.user_metadata?.full_name || (email ? email.split('@')[0] : 'Workspace Member');

  return {
    id: currentUser?.id || null,
    full_name: fullName,
    avatar_url: currentUser?.user_metadata?.avatar_url || '',
    role: 'Member',
    bio: '',
    website: ''
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId, currentUser = user) => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        return data;
      }

      const fallbackProfile = resolveFallbackProfile(currentUser || user);
      setProfile(fallbackProfile);
      return fallbackProfile;
    } catch (err) {
      console.error('Error fetching profile:', err);
      const fallbackProfile = resolveFallbackProfile(currentUser || user);
      setProfile(fallbackProfile);
      return fallbackProfile;
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id, session.user);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Auth session error:', err);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id, session.user);
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
        await fetchProfile(data.user.id, data.user);
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
        await fetchProfile(data.user.id, data.user);
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
        .eq('id', user.id)
        .select();

      if (error) throw error;

      const nextProfile = data?.[0] || { ...profile, ...updates, id: user.id };
      setProfile(nextProfile);
      return { data: nextProfile, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const value = {
    user,
    profile,
    loading,
    isAuthenticated: Boolean(user) && !loading,
    isLiveSupabase: isLiveSupabaseConfigured,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refetchProfile: async () => (user ? fetchProfile(user.id, user) : null)
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
