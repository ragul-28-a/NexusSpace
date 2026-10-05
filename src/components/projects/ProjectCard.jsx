import React from 'react';
import { 
  Folder, 
  Calendar, 
  CheckSquare, 
  Eye, 
  Edit3, 
  Trash2, 
  Tag, 
  Globe, 
  Lock,
  ArrowUpRight
} from 'lucide-react';

export const ProjectCard = ({ project, tasks = [], onSelect, onEdit, onDelete, currentUserId }) => {
  const isOwner = currentUserId && project.user_id === currentUserId;

  // Task Progress Calculation
  const projectTasks = tasks.filter(t => t.project_id === project.id);
  const completedTasks = projectTasks.filter(t => t.is_completed).length;
  const progressPercent = projectTasks.length > 0 
    ? Math.round((completedTasks / projectTasks.length) * 100) 
    : 0;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed': return 'badge-emerald';
      case 'In Progress': return 'badge-cyan';
      case 'Planning': return 'badge-primary';
      case 'On Hold': return 'badge-amber';
      default: return 'badge-primary';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Urgent': return 'badge-rose';
      case 'High': return 'badge-amber';
      case 'Medium': return 'badge-primary';
      default: return 'badge-cyan';
    }
  };

  return (
    <div className="glass-card glass-card-hover" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* Cover Image Container */}
      <div style={{ position: 'relative', height: '160px', width: '100%', overflow: 'hidden', background: '#0f172a' }}>
        {project.cover_url ? (
          <img 
            src={project.cover_url} 
            alt={project.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.2))' }}>
            <Folder className="w-12 h-12 text-indigo-400" />
          </div>
        )}

        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '0.4rem' }}>
          <span className={`badge ${getStatusBadge(project.status)}`}>
            {project.status}
          </span>
          <span className={`badge ${getPriorityBadge(project.priority)}`}>
            {project.priority}
          </span>
        </div>

        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
          {project.is_public ? (
            <span className="badge badge-emerald" title="Public Project (RLS: Read Public)"><Globe className="w-3 h-3" /> Public</span>
          ) : (
            <span className="badge badge-amber" title="Private Project (RLS: Owner Only)"><Lock className="w-3 h-3" /> Private</span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Tag className="w-3 h-3 text-cyan-400" /> {project.category || 'General'}
          </div>

          <h3 
            onClick={() => onSelect(project)} 
            style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            className="hover:text-indigo-400 transition-colors"
          >
            {project.title}
          </h3>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '1.25rem' }}>
            {project.description || 'No description provided.'}
          </p>
        </div>

        <div>
          {/* Relational Tasks Progress Bar */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckSquare className="w-3.5 h-3.5 text-indigo-400" /> Tasks ({completedTasks}/{projectTasks.length})
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div style={{ height: '6px', width: '100%', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  height: '100%', 
                  width: `${progressPercent}%`, 
                  background: 'linear-gradient(90deg, #6366f1, #06b6d4)', 
                  borderRadius: '999px',
                  transition: 'width 0.4s ease'
                }} 
              />
            </div>
          </div>

          {/* Action Buttons & RLS Ownership controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
            <button 
              onClick={() => onSelect(project)} 
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.8rem' }}
            >
              <Eye className="w-3.5 h-3.5" /> View Project <ArrowUpRight className="w-3 h-3 text-indigo-400" />
            </button>

            {isOwner && (
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button 
                  onClick={() => onEdit(project)} 
                  className="btn btn-secondary btn-icon btn-sm" 
                  title="Edit Project Details"
                >
                  <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                </button>

                <button 
                  onClick={() => onDelete(project.id)} 
                  className="btn btn-danger btn-icon btn-sm" 
                  title="Delete Project (RLS: Owner Only)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
