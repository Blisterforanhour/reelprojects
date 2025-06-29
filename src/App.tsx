import React, { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useAuthStore, initializeSupabase } from '@reelapps/auth'
import { AppWrapper } from '@reelapps/ui'
import CreateProjectForm from './components/CreateProjectForm'
import ProjectDetailView from './components/ProjectDetailView'
import './App.css'

interface Project {
  id: string;
  name: string;
  description: string;
  goals?: string;
  target_skills: string[];
  analysis: any;
  plan: string[];
  skill_demonstrations: any[];
  status: string;
  created_at: string;
  type: string;
}

function ProjectListView({ projects, onAddProject }: { projects: Project[], onAddProject: (project: Project) => void }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const navigate = useNavigate();

  const addProject = (project: Project) => {
    onAddProject(project);
    setShowCreateForm(false); // Close the form after successful creation
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
  };

  const handleProjectClick = (project: Project) => {
    // Pass the project data in navigation state
    navigate(`/project/${project.id}`, { state: { project } });
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-4">ReelProject</h1>
          <p className="text-text-secondary">Collaborative project management for modern teams</p>
        </div>

        <div className="grid gap-6">
          {!showCreateForm ? (
            <div className="bg-surface rounded-lg border border-surface p-6">
              <button 
                onClick={() => setShowCreateForm(true)}
                className="w-full p-4 border-2 border-dashed border-surface-hover rounded-lg hover:bg-surface-hover transition-colors text-text-secondary hover:text-text-primary"
              >
                + Create New Project
              </button>
            </div>
          ) : (
            <CreateProjectForm 
              onProjectCreated={addProject} 
              onClose={handleCloseForm}
            />
          )}
          
          {projects.length > 0 && (
            <div className="bg-surface rounded-lg border border-surface p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Your Projects</h2>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div 
                    key={project.id}
                    className="p-4 border border-surface rounded-lg hover:bg-surface-hover cursor-pointer transition-colors"
                    onClick={() => handleProjectClick(project)}
                  >
                    <h3 className="font-semibold text-text-primary">{project.name}</h3>
                    <p className="text-text-secondary text-sm">{project.description}</p>
                    <p className="text-text-tertiary text-xs mt-2">
                      Created: {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  const {
    initialize,
    isLoading,
    isInitializing: storeInitializing,
    isAuthenticated,
    user,
    login,
    signup,
    sendPasswordResetEmail,
    error,
  } = useAuthStore();
  const [localInitializing, setLocalInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  // Load projects from localStorage on app init
  useEffect(() => {
    const savedProjects = localStorage.getItem('reelProjects');
    if (savedProjects) {
      try {
        const parsedProjects = JSON.parse(savedProjects);
        setProjects(parsedProjects);
      } catch (error) {
        console.error('Error parsing saved projects:', error);
      }
    }
  }, []);

  // Save projects to localStorage whenever projects change
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('reelProjects', JSON.stringify(projects));
    }
  }, [projects]);

  const addProject = (project: Project) => {
    setProjects(prevProjects => [...prevProjects, project]);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseAnonKey) throw new Error('Missing Supabase env');
        initializeSupabase(supabaseUrl, supabaseAnonKey);
        await initialize();
      } catch (error) {
        setInitError(error instanceof Error ? error.message : 'Init error');
      } finally {
        setLocalInitializing(false);
      }
    };
    init();
  }, [initialize]);

  if (localInitializing || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading ReelProject...</p>
        </div>
      </div>
    );
  }

  if (initError) {
    return <div className="min-h-screen flex items-center justify-center">{initError}</div>;
  }

  return (
    <AppWrapper
      isAuthenticated={isAuthenticated}
      isInitializing={storeInitializing ?? false}
      _user={user}
      error={error ?? null}
      onLogin={login}
      onSignup={signup}
      onPasswordReset={sendPasswordResetEmail}
      isLoading={isLoading ?? false}
    >
      <Routes>
        <Route path="/" element={<ProjectListView projects={projects} onAddProject={addProject} />} />
        <Route path="/project/:id" element={<ProjectDetailView projects={projects} />} />
      </Routes>
    </AppWrapper>
  );
}

export default App
