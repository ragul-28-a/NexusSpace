import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';

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
  const { user, profile, isLiveSupabase } = useAuth();
  const { addToast } = useToast();

  const isAdmin = profile?.role === 'Admin' || user?.email === 'admin@nexusspace.io';

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

  // Fetch Projects, Tasks, and Files from Supabase / Mock Engine
  const fetchAllData = async () => {
    setLoadingData(true);
    try {
      // 1. Fetch Projects
      const { data: projData, error: projErr } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projErr) throw projErr;
      setProjects(projData || []);

      // 2. Fetch Tasks
      const { data: taskData, error: taskErr } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: true });

      if (!taskErr) setTasks(taskData || []);

      // 3. Fetch Files
      const { data: fileData, error: fileErr } = await supabase
        .from('project_files')
        .select('*')
        .order('created_at', { ascending: false });

      if (!fileErr) setFiles(fileData || []);

    } catch (err) {
      console.error('Error fetching Supabase data:', err);
      addToast('Failed to load workspace data.', 'error');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user]);

  // ------------------------------------------------------------------
  // PROJECT CRUD OPERATIONS
  // ------------------------------------------------------------------
  const handleSaveProject = async (projectData, editId) => {
    if (editId) {
      // Update
      const { data, error } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', editId)
        .select();

      if (error) throw error;
      setProjects(prev => prev.map(p => p.id === editId ? { ...p, ...projectData } : p));
      if (selectedProject?.id === editId) {
        setSelectedProject(prev => ({ ...prev, ...projectData }));
      }
    } else {
      // Insert
      const { data, error } = await supabase
        .from('projects')
        .insert(projectData)
        .select();

      if (error) throw error;

      const newProj = Array.isArray(data) ? data[0] : (data || { ...projectData, id: `proj-${Date.now()}` });
      setProjects(prev => [newProj, ...prev]);
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
      addToast('Failed to delete project.', 'error');
    }
  };

  // ------------------------------------------------------------------
  // RELATIONAL TASK CRUD OPERATIONS
  // ------------------------------------------------------------------
  const handleAddTask = async (taskData) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select();

    if (error) throw error;
    const newTask = Array.isArray(data) ? data[0] : (data || { ...taskData, id: `task-${Date.now()}` });
    setTasks(prev => [...prev, newTask]);
  };

  const handleToggleTask = async (taskId, isCompleted) => {
    const { error } = await supabase
      .from('tasks')
      .update({ is_completed: isCompleted })
      .eq('id', taskId);

    if (!error) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, is_completed: isCompleted } : t));
    }
  };

  const handleDeleteTask = async (taskId) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (!error) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      addToast('Task removed.', 'info');
    }
  };

  // ------------------------------------------------------------------
  // SUPABASE STORAGE FILES OPERATIONS
  // ------------------------------------------------------------------
  const handleFileUpload = async (fileRecord) => {
    const { data, error } = await supabase
      .from('project_files')
      .insert(fileRecord)
      .select();

    if (!error) {
      const newFile = Array.isArray(data) ? data[0] : (data || { ...fileRecord, id: `file-${Date.now()}` });
      setFiles(prev => [newFile, ...prev]);
    }
  };

  const handleFileDelete = async (fileId) => {
    const { error } = await supabase
      .from('project_files')
      .delete()
      .eq('id', fileId);

    if (!error) {
      setFiles(prev => prev.filter(f => f.id !== fileId));
      addToast('File attachment deleted.', 'info');
    }
  };

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <DashboardPage
            projects={projects}
            tasks={tasks}
            files={files}
            onOpenCreate={() => { setProjectToEdit(null); setIsProjectFormOpen(true); }}
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
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}
