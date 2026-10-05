import React from 'react';
import { 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  ListTodo, 
  Plus, 
  Sparkles, 
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DashboardPage = ({ projects = [], tasks = [], files = [], onOpenCreate, setActiveTab }) => {
  const { user, profile } = useAuth();

  const totalProjects = projects.length;
  const inProgressProjects = projects.filter(p => p.status === 'In Progress').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.is_completed).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Welcome Banner */}
      <div className="glass-card" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)', border: '1px solid rgba(99, 102, 241, 0.25)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '680px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', marginBottom: '1rem', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Powered by React & Supabase
          </div>
          
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            Welcome back, <span className="gradient-text">{profile?.full_name || (user?.email ? user.email.split('@')[0] : 'Workspace Member')}</span> 👋
          </h1>
          
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Manage full-stack projects, handle relational tasks, upload assets to Supabase Storage, and organize your workspace effortlessly across mobile and laptop.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={onOpenCreate} className="btn btn-primary">
              <Plus className="w-4 h-4" /> Create New Project
            </button>
            <button onClick={() => setActiveTab('projects')} className="btn btn-secondary">
              <FolderKanban className="w-4 h-4" /> View All Projects
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.85rem', background: 'rgba(99, 102, 241, 0.15)', borderRadius: 'var(--radius-md)', color: '#818cf8' }}>
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Projects</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{totalProjects}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.85rem', background: 'rgba(6, 182, 212, 0.15)', borderRadius: 'var(--radius-md)', color: '#22d3ee' }}>
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>In Progress</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{inProgressProjects}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.85rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: 'var(--radius-md)', color: '#34d399' }}>
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Completed</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{completedProjects}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.85rem', background: 'rgba(168, 85, 247, 0.15)', borderRadius: 'var(--radius-md)', color: '#c084fc' }}>
            <ListTodo className="w-6 h-6" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Relational Tasks</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{completedTasks}/{totalTasks}</div>
          </div>
        </div>

      </div>

      {/* Recent Activity / Projects Overview */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Active Projects Quick Glance</h2>
          <button onClick={() => setActiveTab('projects')} className="btn btn-secondary btn-sm">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {projects.slice(0, 3).map((p) => (
            <div 
              key={p.id} 
              className="glass-card" 
              style={{ padding: '1rem', cursor: 'pointer', background: 'rgba(0,0,0,0.2)' }}
              onClick={() => setActiveTab('projects')}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                {p.category}
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{p.title}</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                <span className="badge badge-cyan">{p.status}</span>
                <span className="badge badge-rose">{p.priority} Priority</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
