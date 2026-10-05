import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Rocket, 
  LayoutDashboard, 
  FolderKanban, 
  User, 
  LogOut, 
  LogIn, 
  Database, 
  Menu, 
  X
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, onOpenAuth, onOpenProfile }) => {
  const { user, profile, signOut, isLiveSupabase } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="glass-card" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => setActiveTab('projects')}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
          }}>
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }} className="gradient-text">NexusSpace</span>
              <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>Full-Stack</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Database className="w-3 h-3 text-cyan-400" />
              <span>{isLiveSupabase ? 'Cloud Supabase' : 'Supabase Backend Active'}</span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="desktop-nav">
          <button
            onClick={() => setActiveTab('projects')}
            className={`btn ${activeTab === 'projects' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem' }}
          >
            <FolderKanban className="w-4 h-4" /> Projects & Tasks
          </button>
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem' }}
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </button>
        </nav>

        {/* Auth Actions / User Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button 
                onClick={onOpenProfile} 
                className="btn btn-secondary" 
                style={{ padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}
              >
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.full_name || 'User'} 
                    style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                ) : (
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>
                    {(profile?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{profile?.full_name || user.email.split('@')[0]}</span>
                <span className="badge badge-cyan" style={{ fontSize: '0.6rem' }}>{profile?.role || 'Member'}</span>
              </button>

              <button 
                onClick={signOut} 
                className="btn btn-danger btn-icon" 
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={onOpenAuth} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
              <LogIn className="w-4 h-4" /> Sign In
            </button>
          )}

          {/* Mobile Hamburger Button */}
          <button 
            className="btn btn-secondary btn-icon mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            style={{ display: 'none' }}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div style={{ borderTop: '1px solid var(--border-color)', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#090d16' }}>
          <button
            onClick={() => { setActiveTab('projects'); setMobileMenuOpen(false); }}
            className={`btn ${activeTab === 'projects' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start' }}
          >
            <FolderKanban className="w-4 h-4" /> Projects & Tasks
          </button>
          <button
            onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
            className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start' }}
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
};
