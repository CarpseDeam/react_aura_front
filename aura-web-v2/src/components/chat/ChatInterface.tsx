// src/components/chat/ChatInterface.tsx
import { useState, useRef, useEffect } from 'react';
import { useChat, DisplayMessage } from '../../hooks/useChat';

interface ChatInterfaceProps {
  activeProject: string | null;
  isBooting: boolean;
}

export const ChatInterface = ({ activeProject, isBooting }: ChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState('');
  const { messages, isProcessing, sendMessage, addMessage } = useChat(activeProject);
  const logRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isBooting || isProcessing) return;

    const message = inputValue;
    setInputValue('');
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Add system messages for various states
  useEffect(() => {
    if (!activeProject && messages.length === 0) {
      addMessage('system', 'No active project. Please create or load a project to begin.', 'info');
    }
  }, [activeProject, messages.length, addMessage]);

  return (
    <>
      <div className="log-display" ref={logRef}>
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isBooting && <span className="cursor-blink">█</span>}
      </div>

      <div className="prompt-area">
        <span className="prompt-prefix">&gt;</span>
        <input
          type="text"
          className="prompt-input"
          placeholder={activeProject ? "Describe what you want to build..." : "Load a project first..."}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isBooting || isProcessing || !activeProject}
        />
        <button
          className="send-button"
          onClick={handleSendMessage}
          disabled={isBooting || isProcessing || !inputValue.trim() || !activeProject}
        >
          {isProcessing ? 'Thinking...' : 'Send'}
        </button>
      </div>
    </>
  );
};

// Chat Message Component
interface ChatMessageProps {
  message: DisplayMessage;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <div className={`system-message ${message.type}`}>
      <span className="system-prefix">[{message.sender.toUpperCase()}]</span>
      <span className="system-text">{message.content}</span>
    </div>
  );
};