import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { ProjectView } from './components/ProjectView';

// Inner component to access context
const MainLayout: React.FC = () => {
  const { activeProjectId, projects } = useApp();
  const activeProject = projects.find(p => p.id === activeProjectId);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {activeProject ? (
          <ProjectView key={activeProject.id} project={activeProject} />
        ) : (
          <Dashboard />
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default App;