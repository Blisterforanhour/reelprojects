import React, { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useAuthStore, initializeSupabase } from './lib/auth'
import { AppWrapper } from './components/AppWrapper'
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
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">ReelProject</h1>
          <p className="text-gray-400">Collaborative project management for modern teams</p>
        </div>

        <div className="grid gap-6">
          {!showCreateForm ? (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <button 
                onClick={() => setShowCreateForm(true)}
                className="w-full p-4 border-2 border-dashed border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
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
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Your Projects</h2>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div 
                    key={project.id}
                    className="p-4 border border-gray-700 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={() => handleProjectClick(project)}
                  >
                    <h3 className="font-semibold text-white">{project.name}</h3>
                    <p className="text-gray-400 text-sm">{project.description}</p>
                    <p className="text-gray-500 text-xs mt-2">
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
        // Mock Supabase initialization
        initializeSupabase('mock-url', 'mock-key');
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading ReelProject...</p>
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