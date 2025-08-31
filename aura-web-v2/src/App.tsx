// src/App.tsx - Complete updated version with real backend integration
import { useState, useEffect } from 'react'
import './App.css'
import { ProjectsModal } from './components/modals/ProjectsModal'
import { SettingsModal } from './components/modals/SettingsModal'
import { ChatInterface } from './components/chat/ChatInterface'
import { TaskList } from './components/mission/TaskList'

interface Message {
  sender: string
  content: string
  type: 'info' | 'good' | 'executing' | 'planning' | 'user' | 'aura'
  id: number
}

function App() {
  const [activeProject, setActiveProject] = useState<string | null>(null)
  const [isBooting, setIsBooting] = useState(true)

  // Modal states
  const [showProjectsModal, setShowProjectsModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showWorkspace, setShowWorkspace] = useState(false)

  // Boot sequence messages for display
  const [bootMessages, setBootMessages] = useState<Message[]>([])

  // Boot sequence animation
  useEffect(() => {
    const bootSequence = [
      { sender: 'KERNEL', content: 'AURA KERNEL V4.0 ... ONLINE', type: 'info' as const, delay: 500 },
      { sender: 'SYSTEM', content: 'Establishing secure link to command deck...', type: 'info' as const, delay: 800 },
      { sender: 'NEURAL', content: 'Cognitive models synchronized.', type: 'good' as const, delay: 400 },
      { sender: 'SYSTEM', content: 'All systems nominal. Ready for user input.', type: 'good' as const, delay: 600 }
    ]

    let messageIndex = 0
    let messageId = 0
    let timeouts: NodeJS.Timeout[] = []

    const showNextMessage = () => {
      if (messageIndex < bootSequence.length) {
        const msg = bootSequence[messageIndex]
        setBootMessages(prev => [...prev, {
          ...msg,
          id: messageId++
        }])
        messageIndex++

        if (messageIndex < bootSequence.length) {
          timeouts.push(setTimeout(showNextMessage, msg.delay))
        } else {
          timeouts.push(setTimeout(() => setIsBooting(false), msg.delay))
        }
      }
    }

    // Clear any existing messages and start boot sequence
    setBootMessages([])
    setIsBooting(true)

    // Start boot sequence after a brief delay
    const initialTimeout = setTimeout(showNextMessage, 300)
    timeouts.push(initialTimeout)

    // Cleanup function to prevent double execution
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout))
    }
  }, [])

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

              {/* Boot Messages Display */}
              {isBooting && (
                <div className="log-display">
                  {bootMessages.map((msg) => (
                    <div key={msg.id} className={`system-message ${msg.type}`}>
                      <span className="system-prefix">[{msg.sender}]</span>
                      <span className="system-text">{msg.content}</span>
                    </div>
                  ))}
                  <span className="cursor-blink">█</span>
                </div>
              )}

              {/* Chat Interface - Only show after boot */}
              {!isBooting && (
                <ChatInterface
                  activeProject={activeProject}
                  isBooting={isBooting}
                />
              )}

              {/* Input disabled during boot */}
              {isBooting && (
                <div className="prompt-area">
                  <span className="prompt-prefix">&gt;</span>
                  <input
                    type="text"
                    className="prompt-input"
                    placeholder="System initializing..."
                    disabled={true}
                  />
                  <button className="send-button" disabled={true}>
                    Send
                  </button>
                </div>
              )}
            </div>

            {/* Mission Control Panel */}
            <TaskList
              activeProject={activeProject}
              isBooting={isBooting}
            />
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