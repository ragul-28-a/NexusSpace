import React, { useState } from 'react';
import { ProjectCard } from '../components/projects/ProjectCard';
import { SkeletonCard } from '../components/ui/Skeleton';
import { 
  Search, 
  Filter, 
  Plus, 
  FolderKanban, 
  X, 
  Layers, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProjectsPage = ({ 
  projects = [], 
  tasks = [], 
  loading = false, 
  onSelectProject, 
  onOpenCreate, 
  onEditProject, 
  onDeleteProject 
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const categories = ['All', 'Web Dev', 'Design', 'Mobile App', 'AI / Data', 'Marketing', 'General'];

  // Search & Filter Logic
  const filteredProjects = projects.filter((proj) => {
    const matchesSearch = 
      proj.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (proj.description && proj.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || proj.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || proj.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await onDeleteProject(deleteConfirmId);
      setDeleteConfirmId(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FolderKanban className="w-7 h-7 text-indigo-400" />
            Projects & Workspaces
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Showing {filteredProjects.length} of {projects.length} workspace projects
          </p>
        </div>

        <button onClick={onOpenCreate} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Create Project
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search className="w-4 h-4" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: '2.4rem', marginBottom: 0 }}
              placeholder="Search projects by title or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Dropdown */}
          <div style={{ minWidth: '160px' }}>
            <select
              className="input-field"
              style={{ marginBottom: 0 }}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>
        </div>

        {/* Category Pill Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{ whiteSpace: 'nowrap', borderRadius: '999px', fontSize: '0.75rem' }}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Projects Grid Container */}
      {loading ? (
        <div className="grid-projects">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <Layers className="w-12 h-12 text-indigo-400" style={{ margin: '0 auto 1rem', opacity: 0.7 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>No matching projects found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            Try resetting your search query or filters, or create a new project to get started.
          </p>
          <button 
            onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setSelectedStatus('All'); }} 
            className="btn btn-secondary"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid-projects">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              tasks={tasks}
              onSelect={onSelectProject}
              onEdit={onEditProject}
              onDelete={(id) => setDeleteConfirmId(id)}
              currentUserId={user?.id}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center', padding: '1.5rem' }}>
            <div style={{ width: '56px', height: '56px', background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Delete Project?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              This action will permanently delete the project, associated tasks, and storage attachments enforced by Supabase RLS cascading delete.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={() => setDeleteConfirmId(null)} className="btn btn-secondary" disabled={deleting}>
                Cancel
              </button>
              <button onClick={confirmDelete} className="btn btn-danger" disabled={deleting}>
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
