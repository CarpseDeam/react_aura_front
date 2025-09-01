// src/components/chat/ChatInterface.tsx
import { useState, useRef, useEffect } from 'react';
import { useChat, type DisplayMessage, AURA_BANNER } from '../../hooks/useChat';

// Get the return type of the hook to properly type the 'chat' prop
type ChatHookReturn = ReturnType<typeof useChat>;

interface ChatInterfaceProps {
  activeProject: string | null;
  chat: ChatHookReturn;
}

export const ChatInterface = ({ activeProject, chat }: ChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState('');
  const { messages, isProcessing, isBooting, sendMessage } = chat;
  const logRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    // This check should mirror the button's disabled logic for consistency.
    if (!inputValue.trim() || isBooting || isProcessing || !activeProject) return;
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

  return (
    <div className="chat-container">
      {/* Render the banner as a static header */}
      <div className="aura-banner">
        <pre>{AURA_BANNER}</pre>
      </div>

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
    </div>
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