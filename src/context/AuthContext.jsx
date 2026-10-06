import React, { createContext, useContext, useEffect, useState } from 'react';
import { isLiveSupabaseConfigured, supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

const profileFromAuthUser = (authUser) => ({
  id: authUser.id,
  full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Workspace Member',
  email: authUser.email || '',
  avatar_url: authUser.user_metadata?.avatar_url || ''
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (authUser) => {
    if (!authUser?.id) {
      setProfile(null);
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      setProfile(data);
      return data;
    }

    const { error: insertError } = await supabase
      .from('profiles')
      .upsert(profileFromAuthUser(authUser), {
        onConflict: 'id',
        ignoreDuplicates: true
      });

    if (insertError) throw insertError;

    const { data: createdProfile, error: refetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (refetchError) throw refetchError;
    setProfile(createdProfile);
    return createdProfile;
  };

  useEffect(() => {
    if (!isLiveSupabaseConfigured) {
      setLoading(false);
      return undefined;
    }

    let isCurrent = true;

    const loadSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (isCurrent && data.session?.user) {
          setUser(data.session.user);
          await fetchProfile(data.session.user);
        }
      } catch (error) {
        console.error('Failed to restore the Supabase session:', error);
        if (isCurrent) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser(session.user);
      if (event !== 'INITIAL_SESSION') {
        setLoading(true);
        window.setTimeout(() => {
          if (isCurrent) {
            fetchProfile(session.user)
              .catch((error) => {
                console.error('Failed to load the authenticated user profile:', error);
                setProfile(null);
              })
              .finally(() => {
                if (isCurrent) setLoading(false);
              });
          }
        }, 0);
      }
    });

    return () => {
      isCurrent = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName.trim() },
          emailRedirectTo: window.location.origin
        }
      });

      if (error) throw error;

      if (data.session?.user) {
        setUser(data.session.user);
        await fetchProfile(data.session.user);
      }

      return {
        data,
        error: null,
        requiresEmailConfirmation: Boolean(data.user && !data.session)
      };
    } catch (error) {
      return { data: null, error, requiresEmailConfirmation: false };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setUser(data.user);
      const signedInProfile = await fetchProfile(data.user);
      return { data, profile: signedInProfile, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
      return { error: null };
    } catch (error) {
      console.error('Failed to sign out from Supabase:', error);
      return { error };
    }
  };

  const updateProfile = async (updates) => {
    if (!user) return { error: new Error('You must be signed in to update your profile.') };

    const allowedUpdates = {
      full_name: updates.full_name,
      avatar_url: updates.avatar_url,
      bio: updates.bio,
      website: updates.website
    };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(allowedUpdates)
        .eq('id', user.id)
        .select('*')
        .single();

      if (error) throw error;
      setProfile(data);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
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
    refetchProfile: () => (user ? fetchProfile(user) : Promise.resolve(null))
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
