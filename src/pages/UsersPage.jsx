import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Users, ShieldCheck, Mail, FolderKanban, Search, RefreshCw } from 'lucide-react';

export const UsersPage = ({ projects = [] }) => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    setError('');

    const { data, error: queryError } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url, role, created_at')
      .order('created_at', { ascending: false });

    if (queryError) {
      console.error('Failed to fetch registered Supabase profiles:', queryError);
      setError('User accounts could not be loaded. Check your connection or permissions, then try again.');
      setProfiles([]);
    } else {
      setProfiles((data || []).filter((profile) => (
        profile.id !== user?.id && String(profile.role || '').toLowerCase() !== 'admin'
      )));
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchProfiles();

    const channel = supabase
      .channel('admin-profile-directory')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles'
      }, fetchProfiles)
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error(`Supabase profile realtime subscription status: ${status}`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProfiles]);

  const filteredProfiles = profiles.filter((profile) => {
    const query = searchQuery.toLowerCase();
    return [profile.full_name, profile.email, profile.role]
      .some((value) => value?.toLowerCase().includes(query));
  });

  const getUserProjectCount = (userId) => projects.filter((project) => project.user_id === userId).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Users className="w-7 h-7 text-indigo-400" />
            User Management Directory
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            {profiles.length} registered member{profiles.length === 1 ? '' : 's'} from Supabase
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="badge badge-rose" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
            <ShieldCheck className="w-4 h-4" /> Admin Authorized View
          </span>
          <button className="btn btn-secondary btn-sm" onClick={fetchProfiles} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <Search className="w-4 h-4" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="search"
            className="input-field"
            style={{ paddingLeft: '2.4rem', marginBottom: 0 }}
            placeholder="Search users by name, email address, or role..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading registered users…
        </div>
      ) : error ? (
        <div className="glass-card" role="alert" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#fb7185', marginBottom: '1rem' }}>{error}</p>
          <button className="btn btn-secondary btn-sm" onClick={fetchProfiles}>Try again</button>
        </div>
      ) : filteredProfiles.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          {profiles.length === 0 ? 'No registered members yet.' : 'No users match your search.'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {filteredProfiles.map((profile) => (
            <div key={profile.id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name || 'User avatar'} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} />
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                    {(profile.full_name || profile.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}

                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {profile.full_name || 'Unnamed member'}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <Mail className="w-3.5 h-3.5" /> {profile.email || 'No email on profile'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span className="badge badge-cyan">{profile.role || 'Member'}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#818cf8', fontWeight: 600 }}>
                  <FolderKanban className="w-3.5 h-3.5" /> {getUserProjectCount(profile.id)} Projects
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
