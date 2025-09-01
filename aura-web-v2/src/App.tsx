import { useState } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LandingPage } from './components/LandingPage';
import { ProjectsModal } from './components/modals/ProjectsModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ChatInterface } from './components/chat/ChatInterface';
import { TaskList } from './components/mission/TaskList';
import { useChat } from './hooks/useChat';
import { useTasks } from './hooks/useTasks'; // Import useTasks here
import { WorkspaceView } from './components/workspace/WorkspaceView';

// Command Deck Component (for authenticated users)
const CommandDeck = () => {
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showWorkspace, setShowWorkspace] = useState(false);

  // --- SINGLE SOURCE OF TRUTH --- 
  // Both useChat and useTasks are called once here.
  const chat = useChat(activeProject);
  const tasksHook = useTasks(activeProject); // The single instance of the hook

  const { user, logout } = useAuth();

  return (
    <div className="app-container">
      <header className="mainframe-header">
        <div className="header-left">
          <h1 className="header-title">AURA // COMMAND DECK</h1>
          <div className="user-info">
            {user?.email}
          </div>
        </div>
        <div className="header-right">
          <button
            className="header-button"
            onClick={() => setShowProjectsModal(true)}
          >
            Projects
          </button>
          <button
            className="header-button"
            onClick={() => setShowSettingsModal(true)}
          >
            Settings
          </button>
          <button
            className="header-button"
            onClick={() => setShowWorkspace(!showWorkspace)}
          >
            {showWorkspace ? 'View Command Deck' : 'View Workspace'}
          </button>
          <button
            className="header-button logout-button"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="main-content">
        {!showWorkspace ? (
          <div className="command-deck">
            <div className="left-panel">
              <ChatInterface
                activeProject={activeProject}
                chat={chat}
              />
            </div>
            <div className="right-panel">
              {/* Pass the hook result down as a prop */}
              <TaskList
                activeProject={activeProject}
                isBooting={chat.isBooting}
                tasksHook={tasksHook}
              />
            </div>
          </div>
        ) : (
          /* Pass the hook result down as a prop */
          <WorkspaceView 
            activeProject={activeProject} 
            isBooting={chat.isBooting} 
            tasksHook={tasksHook}
          />
        )}
      </div>

      {showProjectsModal && (
        <ProjectsModal
          activeProject={activeProject}
          onSelectProject={setActiveProject}
          onClose={() => setShowProjectsModal(false)}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
};

// Main App Component with Authentication
const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <span className="aura-logo-small">AURA</span>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <CommandDeck /> : <LandingPage />;
};

// Root App Component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;