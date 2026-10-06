import React, { useState, useEffect } from 'react';
import { isLiveSupabaseConfigured, supabase } from './lib/supabaseClient';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { getProjectAssetPath } from './lib/storagePaths';

// Components & Pages
import { Navbar } from './components/navbar/Navbar';
import { AuthModal } from './components/auth/AuthModal';
import { ProjectFormModal } from './components/projects/ProjectFormModal';
import { ProjectDetailModal } from './components/projects/ProjectDetailModal';
import { ProfileModal } from './components/profile/ProfileModal';

import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { UsersPage } from './pages/UsersPage';

import { Database } from 'lucide-react';

const MainApp = () => {
  const { user, profile, loading: authLoading, isLiveSupabase } = useAuth();
  const { addToast } = useToast();

  const isAdmin = profile?.role === 'Admin';

  const ensureUserSession = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return false;
    }
    return true;
  };

  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'dashboard' | 'users'

  // Data Collections State
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [files, setFiles] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Modals Control
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    setProjects([]);
    setTasks([]);
    setFiles([]);
    setSelectedProject(null);

    if (!user) {
      setActiveTab('projects');
      setLoadingData(false);
      return () => { isCurrent = false; };
    }

    const fetchAllData = async () => {
      setLoadingData(true);
      try {
        const [projectsResult, tasksResult, filesResult] = await Promise.all([
          supabase.from('projects').select('*').order('created_at', { ascending: false }),
          supabase.from('tasks').select('*').order('created_at', { ascending: true }),
          supabase.from('project_files').select('*').order('created_at', { ascending: false })
        ]);

        const failedResult = [projectsResult, tasksResult, filesResult].find(({ error }) => error);
        if (failedResult?.error) throw failedResult.error;

        if (isCurrent) {
          setProjects(projectsResult.data || []);
          setTasks(tasksResult.data || []);
          setFiles(filesResult.data || []);
        }
      } catch (error) {
        console.error('Failed to load Supabase workspace data:', error);
        if (isCurrent) addToast('Workspace data could not be loaded. Please try again.', 'error');
      } finally {
        if (isCurrent) setLoadingData(false);
      }
    };

    fetchAllData();
    return () => { isCurrent = false; };
  }, [user, addToast]);

  useEffect(() => {
    if (!authLoading && activeTab === 'users' && !isAdmin) {
      setActiveTab('projects');
    }
  }, [activeTab, authLoading, isAdmin]);

  // ------------------------------------------------------------------
  // PROJECT CRUD OPERATIONS
  // ------------------------------------------------------------------
  const handleSaveProject = async (projectData, editId) => {
    if (!user) throw new Error('Sign in before saving a project.');
    const ownedProjectData = { ...projectData, user_id: user.id };

    if (editId) {
      const { data, error } = await supabase
        .from('projects')
        .update(ownedProjectData)
        .eq('id', editId)
        .select()
        .single();

      if (error) throw error;
      setProjects(prev => prev.map(p => p.id === editId ? data : p));
      if (selectedProject?.id === editId) {
        setSelectedProject(data);
      }
    } else {
      const { data, error } = await supabase
        .from('projects')
        .insert(ownedProjectData)
        .select();

      if (error) throw error;

      setProjects(prev => [data[0], ...prev]);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      setProjects(prev => prev.filter(p => p.id !== projectId));
      setTasks(prev => prev.filter(t => t.project_id !== projectId));
      setFiles(prev => prev.filter(f => f.project_id !== projectId));
      
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
      }
      addToast('Project deleted successfully.', 'success');
    } catch (err) {
      console.error('Failed to delete project:', err);
      addToast(err.message || 'Failed to delete project.', 'error');
    }
  };

  // ------------------------------------------------------------------
  // RELATIONAL TASK CRUD OPERATIONS
  // ------------------------------------------------------------------
  const handleAddTask = async (taskData) => {
    if (!user) throw new Error('Sign in before adding a task.');
    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...taskData, user_id: user.id })
      .select();

    if (error) throw error;
    setTasks(prev => [...prev, data[0]]);
  };

  const handleToggleTask = async (taskId, isCompleted) => {
    const { error } = await supabase
      .from('tasks')
      .update({ is_completed: isCompleted })
      .eq('id', taskId);

    if (error) {
      console.error('Failed to update task:', error);
      addToast('Failed to update task. Please try again.', 'error');
      return;
    }
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, is_completed: isCompleted } : t));
  };

  const handleDeleteTask = async (taskId) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Failed to delete task:', error);
      addToast('Failed to delete task. Please try again.', 'error');
      return;
    }
    setTasks(prev => prev.filter(t => t.id !== taskId));
    addToast('Task removed.', 'info');
  };

  // ------------------------------------------------------------------
  // SUPABASE STORAGE FILES OPERATIONS
  // ------------------------------------------------------------------
  const handleFileUpload = async (fileRecord) => {
    if (!user) throw new Error('Sign in before attaching a file.');
    const { data, error } = await supabase
      .from('project_files')
      .insert({ ...fileRecord, user_id: user.id })
      .select();

    if (error) throw error;
    setFiles(prev => [data[0], ...prev]);
  };

  const handleFileDelete = async (file) => {
    try {
      const path = getProjectAssetPath(file.file_url);
      if (path) {
        const { error: storageError } = await supabase.storage
          .from('project-assets')
          .remove([path]);
        if (storageError) throw storageError;
      }

      const { error } = await supabase
        .from('project_files')
        .delete()
        .eq('id', file.id);

      if (error) throw error;
      setFiles(prev => prev.filter(item => item.id !== file.id));
      addToast('File attachment deleted.', 'info');
    } catch (error) {
      console.error('Failed to delete project file:', error);
      addToast('Failed to delete file attachment. Please try again.', 'error');
    }
  };

  return (
    <div className="app-container">
      {authLoading && (
        <div className="glass-card" style={{ margin: '2rem auto', padding: '1.5rem', maxWidth: '520px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Restoring your secure Supabase session…
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="main-content" style={{ display: authLoading ? 'none' : undefined }}>
        {activeTab === 'dashboard' && (
          <DashboardPage
            projects={projects}
            tasks={tasks}
            files={files}
            onOpenCreate={() => {
              if (!ensureUserSession()) return;
              setProjectToEdit(null);
              setIsProjectFormOpen(true);
            }}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectsPage
            projects={projects}
            tasks={tasks}
            loading={loadingData}
            onSelectProject={(proj) => setSelectedProject(proj)}
            onOpenCreate={() => {
              if (!ensureUserSession()) return;
              setProjectToEdit(null);
              setIsProjectFormOpen(true);
            }}
            onEditProject={(proj) => { setProjectToEdit(proj); setIsProjectFormOpen(true); }}
            onDeleteProject={handleDeleteProject}
          />
        )}

        {activeTab === 'users' && isAdmin && (
          <UsersPage projects={projects} />
        )}

        {!user && activeTab !== 'projects' && (
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', maxWidth: '540px', margin: '2rem auto 0' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Please sign in to continue</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Your workspace is protected and requires an active Supabase session.</p>
            <button onClick={() => setIsAuthModalOpen(true)} className="btn btn-primary">Open login</button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '1.5rem', marginTop: 'auto', background: '#070a12' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>NexusSpace &copy; {new Date().getFullYear()}</span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: isLiveSupabase ? '#34d399' : '#38bdf8' }}>
              <Database className="w-4 h-4" /> {isLiveSupabase ? 'Cloud Supabase Active' : 'Supabase Backend Active'}
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <ProjectFormModal
        isOpen={isProjectFormOpen}
        onClose={() => setIsProjectFormOpen(false)}
        onSave={handleSaveProject}
        projectToEdit={projectToEdit}
      />

      <ProjectDetailModal
        project={selectedProject}
        isOpen={Boolean(selectedProject)}
        onClose={() => setSelectedProject(null)}
        tasks={tasks}
        files={files}
        onAddTask={handleAddTask}
        onToggleTask={handleToggleTask}
        onDeleteTask={handleDeleteTask}
        onFileUpload={handleFileUpload}
        onFileDelete={handleFileDelete}
        onEdit={(proj) => { setProjectToEdit(proj); setIsProjectFormOpen(true); }}
        onDelete={handleDeleteProject}
        currentUserId={user?.id}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

    </div>
  );
};

export default function App() {
  if (!isLiveSupabaseConfigured) {
    return (
      <div className="app-container">
        <main className="main-content">
          <section className="glass-card" style={{ margin: '3rem auto', padding: '2rem', maxWidth: '620px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>Supabase configuration required</h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Add VITE_SUPABASE_URL and either VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY to your local environment and Vercel project settings, then redeploy. Demo authentication and fake data are disabled.
            </p>
          </section>
        </main>
      </div>
    );
  }

  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}
