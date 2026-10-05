import React from 'react';
import { TaskManager } from '../tasks/TaskManager';
import { FileManager } from '../storage/FileManager';
import { 
  X, 
  Tag, 
  Calendar, 
  User, 
  Globe, 
  Lock, 
  Edit3, 
  Trash2, 
  Folder 
} from 'lucide-react';

export const ProjectDetailModal = ({ 
  project, 
  isOpen, 
  onClose, 
  tasks, 
  files,
  onAddTask, 
  onToggleTask, 
  onDeleteTask, 
  onFileUpload, 
  onFileDelete,
  onEdit, 
  onDelete, 
  currentUserId 
}) => {
  if (!isOpen || !project) return null;

  const isOwner = currentUserId && project.user_id === currentUserId;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '820px', width: '95%' }}>
        
        {/* Banner Cover Image */}
        <div style={{ position: 'relative', height: '220px', width: '100%', background: '#0f172a' }}>
          {project.cover_url ? (
            <img src={project.cover_url} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(6,182,212,0.25))' }}>
              <Folder className="w-16 h-16 text-indigo-400" />
            </div>
          )}

          <button 
            onClick={onClose} 
            style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(9, 13, 22, 0.8)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X className="w-5 h-5" />
          </button>

          <div style={{ position: 'absolute', bottom: '15px', left: '20px', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge badge-primary">{project.category || 'General'}</span>
            <span className="badge badge-cyan">{project.status}</span>
            <span className="badge badge-rose">{project.priority} Priority</span>
            {project.is_public ? (
              <span className="badge badge-emerald"><Globe className="w-3 h-3" /> Public (RLS Viewable)</span>
            ) : (
              <span className="badge badge-amber"><Lock className="w-3 h-3" /> Private (Owner Only)</span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="modal-body" style={{ padding: '1.75rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.4rem' }}>{project.title}</h2>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar className="w-4 h-4 text-indigo-400" /> Created {new Date(project.created_at).toLocaleDateString()}
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <User className="w-4 h-4 text-cyan-400" /> Owner: {isOwner ? 'You (Owner)' : 'Member'}
                </span>
              </div>
            </div>

            {isOwner && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => { onClose(); onEdit(project); }} 
                  className="btn btn-secondary btn-sm"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Details
                </button>

                <button 
                  onClick={() => { onClose(); onDelete(project.id); }} 
                  className="btn btn-danger btn-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </div>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem', whiteSpace: 'pre-line' }}>
            {project.description || 'No detailed description specified for this project.'}
          </p>

          {/* Relational Tasks Management */}
          <TaskManager 
            projectId={project.id}
            tasks={tasks}
            onAddTask={onAddTask}
            onToggleTask={onToggleTask}
            onDeleteTask={onDeleteTask}
            isOwner={isOwner}
          />

          {/* Supabase Storage Files Attachment Management */}
          <FileManager 
            projectId={project.id}
            files={files}
            onFileUploaded={onFileUpload}
            onFileDeleted={onFileDelete}
            isOwner={isOwner}
          />

        </div>
      </div>
    </div>
  );
};
