import { useState, useEffect } from 'react'
import './App.css'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LandingPage } from './components/LandingPage'
import { ProjectsModal } from './components/modals/ProjectsModal'
import { SettingsModal } from './components/modals/SettingsModal'
import { ChatInterface } from './components/chat/ChatInterface'
import { TaskList } from './components/mission/TaskList'
import { useChat } from './hooks/useChat'

// Your beautiful ASCII logo component
const AuraAsciiLogo = () => (
  <pre className="boot-ascii-logo">
    {`
    █████╗ ██╗   ██╗██████╗  █████╗
   ██╔══██╗██║   ██║██╔══██╗██╔══██╗
   ███████║██║   ██║██████╔╝███████║
   ██╔══██║██║   ██║██╔══██╗██╔══██║
   ██║  ██║╚██████╔╝██║  ██║██║  ██║
   ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝
    `}
  </pre>
);

// Command Deck Component (for authenticated users)
const CommandDeck = () => {
  const [activeProject, setActiveProject] = useState<string | null>(null)
  const [showProjectsModal, setShowProjectsModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showWorkspace, setShowWorkspace] = useState(false)
  const [systemBooting, setSystemBooting] = useState(true)
  const [bootStep, setBootStep] = useState(0)
  const [bootExiting, setBootExiting] = useState(false)

  const chat = useChat(activeProject)
  const { user, logout } = useAuth()

  const bootMessages = [
    'INITIALIZING AURA KERNEL V4.0...',
    'LOADING NEURAL NETWORKS...',
    'ESTABLISHING COMMAND LINK...',
    'SYSTEM READY'
  ]

  const asciiLogo = `
    ██████╗ ██╗   ██╗██████╗  ██████╗
   ██╔═══██╗██║   ██║██╔══██╗██╔═══██╗
   ███████║██║   ██║██████╔╝███████║
   ██╔═══██║██║   ██║██╔══██╗██╔═══██║
   ██║   ██║╚██████╔╝██║  ██║██║   ██║
   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝   ╚═╝
  `

  // System boot sequence when entering command deck
  useEffect(() => {
    if (!systemBooting) return

    const bootSequence = bootMessages.map((_, index) =>
      setTimeout(() => setBootStep(index), index * 600)
    )

    const finishBoot = setTimeout(() => {
      setBootExiting(true)
      setTimeout(() => setSystemBooting(false), 500) // Time for exit animation
    }, bootMessages.length * 600 + 800)

    return () => {
      bootSequence.forEach(clearTimeout)
      clearTimeout(finishBoot)
    }
  }, [systemBooting])

  // Show boot screen during initial system boot
  if (systemBooting) {
    return (
      <div className={`boot-screen ${bootExiting ? 'exiting' : ''}`}>
        <div className="boot-content">
          <div className="aura-boot-logo">
            <AuraAsciiLogo />
            <p className="tagline">AUTONOMOUS VIRTUAL MACHINE</p>
          </div>
          <div className="boot-messages">
            {bootMessages.map((message, index) => (
              <div
                key={index}
                className={`boot-message ${index <= bootStep ? 'visible' : ''} ${index === bootStep ? 'active' : ''}`}
              >
                {message}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

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
          <span className="user-info">
            {user?.email}
          </span>
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
          <button
            className="header-button logout-button"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {!showWorkspace ? (
          <div className="command-deck">
            <div className="left-panel">
              <TaskList
                activeProject={activeProject}
                isBooting={chat.isBooting}
              />
            </div>
            <div className="right-panel">
              <ChatInterface
                activeProject={activeProject}
                chat={chat}
              />
            </div>
          </div>
        ) : (
          <div className="workspace-view">
            <div className="workspace-placeholder">
              <h2>Workspace View</h2>
              <p>File explorer and code editor will go here...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Main App Component with Authentication
const AppContent = () => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <span className="aura-logo-small">AURA</span>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return isAuthenticated ? <CommandDeck /> : <LandingPage />
}

// Root App Component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App