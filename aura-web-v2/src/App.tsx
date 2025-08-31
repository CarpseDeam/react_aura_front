// src/App.tsx - Complete updated version with real backend integration
import { useState } from 'react'
import './App.css'
import { ProjectsModal } from './components/modals/ProjectsModal'
import { SettingsModal } from './components/modals/SettingsModal'
import { ChatInterface } from './components/chat/ChatInterface'
import { TaskList } from './components/mission/TaskList'
import { useChat } from './hooks/useChat'

function App() {
  const [activeProject, setActiveProject] = useState<string | null>(null)

  // Modal states
  const [showProjectsModal, setShowProjectsModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showWorkspace, setShowWorkspace] = useState(false)

  const chat = useChat(activeProject)

  return (
    <div className="app-container">
      {/* Modals */}
      {showProjectsModal && (
        <ProjectsModal
          onClose={() => setShowProjectsModal(false)}
          onSelectProject={setActiveProject}
          activeProject={activeProject}
        />
      )}

      {showSettingsModal && (
        <SettingsModal onClose={() => setShowSettingsModal(false)} />
      )}

      {/* Header */}
      <header className="mainframe-header">
        <div className="header-left">
          <span className="header-title">AURA // COMMAND DECK</span>
          {activeProject && (
            <span className="active-project-display">
              <span className="label">PROJECT:</span> {activeProject}
            </span>
          )}
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
            className={`header-button ${showWorkspace ? 'active' : ''}`}
            onClick={() => setShowWorkspace(!showWorkspace)}
          >
            {showWorkspace ? 'View Command Deck' : 'View Workspace'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {!showWorkspace ? (
          <>
            {/* Command Deck Panel */}
            <div className="command-deck-panel">
              <div className="terminal-header">
                <div className="ascii-banner">
                  {`    █████╗ ██╗   ██╗██████╗  █████╗
   ██╔══██╗██║   ██║██╔══██╗██╔══██╗
   ███████║██║   ██║██████╔╝███████║
   ██╔══██║██║   ██║██╔══██╗██╔══██║
   ██║  ██║╚██████╔╝██║  ██║██║  ██║
   ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝`}
                </div>
                <p className="tagline">A U T O N O M O U S  V I R T U A L  M A C H I N E</p>
              </div>

              <ChatInterface
                activeProject={activeProject}
                chat={chat}
              />
            </div>

            {/* Mission Control Panel */}
            <TaskList activeProject={activeProject} />
          </>
        ) : (
          // Workspace View
          <div className="workspace-panel">
            <h2>🚧 WORKSPACE VIEW</h2>
            <p>File explorer and code editor coming soon...</p>
            <p>Click "View Command Deck" to return to the main interface.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App