// src/App.tsx - With working buttons
import { useState, useEffect } from 'react'
import './App.css'

interface Message {
  sender: string
  content: string
  type: 'info' | 'good' | 'executing' | 'planning' | 'user' | 'aura'
  id: number
}

interface Task {
  id: number
  description: string
  status: 'pending' | 'completed'
}

function App() {
  const [activeProject, setActiveProject] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isBooting, setIsBooting] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [inputValue, setInputValue] = useState('')

  // Modal states
  const [showProjectsModal, setShowProjectsModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showWorkspace, setShowWorkspace] = useState(false)

  // Boot sequence animation (same as before)
  useEffect(() => {
    const bootMessages = [
      { sender: 'KERNEL', content: 'AURA KERNEL V4.0 ... ONLINE', type: 'info' as const, delay: 500 },
      { sender: 'SYSTEM', content: 'Establishing secure link to command deck...', type: 'info' as const, delay: 800 },
      { sender: 'NEURAL', content: 'Cognitive models synchronized.', type: 'good' as const, delay: 400 },
      { sender: 'SYSTEM', content: 'All systems nominal. Ready for user input.', type: 'good' as const, delay: 600 }
    ]

    let messageIndex = 0
    let messageId = 0
    let timeouts: NodeJS.Timeout[] = []

    const showNextMessage = () => {
      if (messageIndex < bootMessages.length) {
        const msg = bootMessages[messageIndex]
        setMessages(prev => [...prev, {
          ...msg,
          id: messageId++
        }])
        messageIndex++

        if (messageIndex < bootMessages.length) {
          timeouts.push(setTimeout(showNextMessage, msg.delay))
        } else {
          timeouts.push(setTimeout(() => setIsBooting(false), msg.delay))
        }
      }
    }

    setMessages([])
    setIsBooting(true)

    const initialTimeout = setTimeout(showNextMessage, 300)
    timeouts.push(initialTimeout)

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout))
    }
  }, [])

  // Button handlers
  const handleSendMessage = () => {
    if (!inputValue.trim() || isBooting) return

    // Add user message
    const userMessage: Message = {
      sender: 'User',
      content: inputValue,
      type: 'user',
      id: Date.now()
    }
    setMessages(prev => [...prev, userMessage])

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        sender: 'Aura',
        content: `I understand you want to: "${inputValue}". Let me help you build that!`,
        type: 'aura',
        id: Date.now() + 1
      }
      setMessages(prev => [...prev, aiMessage])
    }, 1000)

    setInputValue('')
  }

  const handleAddTask = () => {
    if (!activeProject) {
      addSystemMessage('No active project. Please create or load a project first.', 'info')
      return
    }

    const newTask: Task = {
      id: Date.now(),
      description: 'New Task - Click to edit',
      status: 'pending'
    }
    setTasks(prev => [...prev, newTask])
    addSystemMessage('Task added to mission queue.', 'good')
  }

  const handleDispatch = () => {
    if (!activeProject) {
      addSystemMessage('No active project loaded.', 'info')
      setShowProjectsModal(true)
      return
    }

    if (tasks.length === 0) {
      addSystemMessage('No tasks in mission queue. Add some tasks first.', 'info')
      return
    }

    addSystemMessage('🚀 DISPATCHING AURA - Mission execution initiated...', 'executing')

    // Simulate mission execution
    setTimeout(() => {
      addSystemMessage('Mission completed successfully! All tasks executed.', 'good')
      setTasks(prev => prev.map(task => ({ ...task, status: 'completed' as const })))
    }, 3000)
  }

  const addSystemMessage = (content: string, type: Message['type']) => {
    const message: Message = {
      sender: 'System',
      content,
      type,
      id: Date.now()
    }
    setMessages(prev => [...prev, message])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
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

              <div className="log-display">
                {messages.map((msg) => (
                  <div key={msg.id} className={`system-message ${msg.type}`}>
                    <span className="system-prefix">[{msg.sender.toUpperCase()}]</span>
                    <span className="system-text">{msg.content}</span>
                  </div>
                ))}
                {isBooting && <span className="cursor-blink">█</span>}
              </div>

              <div className="prompt-area">
                <span className="prompt-prefix">&gt;</span>
                <input
                  type="text"
                  className="prompt-input"
                  placeholder="Describe what you want to build..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isBooting}
                />
                <button
                  className="send-button"
                  onClick={handleSendMessage}
                  disabled={isBooting || !inputValue.trim()}
                >
                  Send
                </button>
              </div>
            </div>

            {/* Mission Control Panel */}
            <div className="mission-control-panel">
              <h3>MISSION CONTROL</h3>

              <div className="task-section">
                <h4>Current Tasks ({tasks.length})</h4>
                <div className="task-list">
                  {tasks.length === 0 ? (
                    <div className="task-item">
                      {activeProject ? 'No tasks assigned' : 'No active project loaded'}
                    </div>
                  ) : (
                    tasks.map(task => (
                      <div key={task.id} className={`task-item ${task.status}`}>
                        <span className="task-status">
                          {task.status === 'completed' ? '✓' : '○'}
                        </span>
                        <span className="task-text">{task.description}</span>
                      </div>
                    ))
                  )}
                </div>
                <button
                  className="add-task-button"
                  onClick={handleAddTask}
                  disabled={isBooting}
                >
                  + Add Task
                </button>
              </div>

              <button
                className="dispatch-button"
                onClick={handleDispatch}
                disabled={isBooting}
              >
                DISPATCH AURA
              </button>
            </div>
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

// Projects Modal Component
function ProjectsModal({ onClose, onSelectProject, activeProject }: {
  onClose: () => void
  onSelectProject: (name: string) => void
  activeProject: string | null
}) {
  const [newProjectName, setNewProjectName] = useState('')
  const [projects] = useState(['my-website', 'python-scraper', 'react-dashboard'])

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      onSelectProject(newProjectName.trim())
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h3>MANAGE PROJECTS</h3>

        <div className="project-section">
          <h4>Existing Projects</h4>
          <div className="project-list">
            {projects.map(project => (
              <div key={project} className="project-item">
                <span className="project-name">{project}</span>
                <button
                  className="project-action load"
                  onClick={() => {
                    onSelectProject(project)
                    onClose()
                  }}
                >
                  Load
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="project-section">
          <h4>Create New Project</h4>
          <div className="create-project">
            <input
              type="text"
              placeholder="Project name..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
            />
            <button onClick={handleCreateProject}>Create</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Settings Modal Component
function SettingsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h3>SETTINGS</h3>
        <div className="settings-section">
          <h4>API Configuration</h4>
          <p>API key management and model assignments will go here...</p>
          <p>For now, this is just a placeholder modal.</p>
        </div>
      </div>
    </div>
  )
}

export default App