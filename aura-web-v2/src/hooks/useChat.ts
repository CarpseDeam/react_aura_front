// src/hooks/useChat.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { chatApi } from '../services/chat';
import type { ChatMessage } from '../types/chat';
import { getWebSocketService } from '../services/websocket';
import type { WebSocketMessage } from '../services/websocket';

export interface DisplayMessage {
  id: string;
  sender: string;
  content: string;
  type: 'info' | 'good' | 'executing' | 'planning' | 'user' | 'aura' | 'error' | 'terminal';
  timestamp: number;
}

export const AURA_BANNER = `
 █████╗ ██╗   ██╗██████╗  █████╗
██╔══██╗██║   ██║██╔══██╗██╔══██╗
███████║██║   ██║██████╔╝███████║
██╔══██║██║   ██║██╔══██╗██╔══██║
██║  ██║╚██████╔╝██║  ██║██║  ██║
╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝

   A U T O N O M O U S   V I R T U A L   M A C H I N E
`;

const BOOT_SEQUENCE = [
  // AURA_BANNER has been removed from here
  { sender: 'KERNEL', content: 'AURA KERNEL V4.0 ... ONLINE', type: 'info' as const, delay: 500 },
  { sender: 'SYSTEM', content: 'Establishing secure link to command deck...', type: 'info' as const, delay: 800 },
  { sender: 'NEURAL', content: 'Cognitive models synchronized.', type: 'good' as const, delay: 400 },
  { sender: 'SYSTEM', content: 'All systems nominal. Ready for user input.', type: 'good' as const, delay: 600 }
];

const PROJECT_PROMPT = 'Please create a new project or load an existing one to begin.';

export const useChat = (activeProject: string | null) => {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const [isBooting, setIsBooting] = useState(true);
  const [hasBooted, setHasBooted] = useState(false);
  const isProcessingRef = useRef(false);

  // Initial boot sequence effect - runs once on mount
  useEffect(() => {
    if (hasBooted) return;

    setIsBooting(true);
    setMessages([]);

    BOOT_SEQUENCE.forEach((message, index) => {
      const totalDelay = BOOT_SEQUENCE.slice(0, index).reduce((acc, msg) => acc + msg.delay, 0);

      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `boot-${index}`,
          sender: message.sender,
          content: message.content,
          type: message.type,
          timestamp: Date.now()
        }]);

        if (index === BOOT_SEQUENCE.length - 1) {
          setTimeout(() => {
            setIsBooting(false);
            setHasBooted(true);
            setMessages(prev => [...prev, {
              id: 'project-prompt',
              sender: 'AURA',
              content: PROJECT_PROMPT,
              type: 'info',
              timestamp: Date.now()
            }]);
          }, 1000);
        }
      }, totalDelay);
    });
  }, []); // Only run once on mount

  // Project change effect - clear conversation when project changes
  useEffect(() => {
    if (!hasBooted) return; // Don't run until after initial boot

    if (activeProject) {
      // Clear conversation and reset for new project
      setConversationHistory([]);
      // Don't clear messages - keep the boot sequence and add project loaded message
      setMessages(prev => [...prev, {
        id: `project-loaded-${Date.now()}`,
        sender: 'SYSTEM',
        content: `Project "${activeProject}" loaded. Ready for commands.`,
        type: 'good',
        timestamp: Date.now()
      }]);
    }
  }, [activeProject, hasBooted]);

  // WebSocket integration for system messages
  useEffect(() => {
    if (!hasBooted || !activeProject) return;

    const webSocketService = getWebSocketService();

    const handleSystemLog = (message: WebSocketMessage) => {
      if (message.type === 'system_log' && message.content) {
        const terminalMessage: DisplayMessage = {
          id: `terminal-${Date.now()}-${Math.random()}`,
          sender: 'TERMINAL',
          content: message.content,
          type: 'terminal',
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, terminalMessage]);
      }
    };

    const handleAgentStatus = (message: WebSocketMessage) => {
      if (message.type === 'agent_status' && message.status) {
        const statusMessage = message.status === 'thinking' ? '🧠 AURA is thinking...' :
                             message.status === 'executing' ? '⚡ AURA is executing commands...' :
                             message.status === 'idle' ? '✅ AURA completed task' : 
                             `📡 AURA status: ${message.status}`;
        
        const terminalMessage: DisplayMessage = {
          id: `status-${Date.now()}`,
          sender: 'STATUS',
          content: statusMessage,
          type: 'terminal',
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, terminalMessage]);
      }
    };

    const unsubscribeSystemLog = webSocketService.on('system_log', handleSystemLog);
    const unsubscribeAgentStatus = webSocketService.on('agent_status', handleAgentStatus);

    return () => {
      unsubscribeSystemLog();
      unsubscribeAgentStatus();
    };
  }, [hasBooted, activeProject]);

  const sendMessage = useCallback(async (content: string) => {
    if (isProcessingRef.current || !activeProject) return;

    isProcessingRef.current = true;
    setIsProcessing(true);

    // Add user message
    const userMessage: DisplayMessage = {
      id: Date.now().toString(),
      sender: 'USER',
      content,
      type: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Add to conversation history
      const newMessage: ChatMessage = { role: 'user', content };
      const updatedHistory = [...conversationHistory, newMessage];
      setConversationHistory(updatedHistory);

      // Use the correct API method
      const response = await chatApi.sendPrompt(activeProject, content, updatedHistory);

      // Add assistant response
      const assistantMessage: DisplayMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'AURA',
        content: response.message || 'Task received and processed.',
        type: 'aura',
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setConversationHistory([...updatedHistory, { role: 'assistant', content: response.message || 'Task received and processed.' }]);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: DisplayMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'SYSTEM',
        content: 'Error communicating with AURA. Please try again.',
        type: 'error',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  }, [activeProject, conversationHistory]);

  return {
    messages,
    isProcessing,
    isBooting,
    sendMessage
  };
};