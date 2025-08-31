// src/hooks/useChat.ts
import { useState, useEffect, useCallback } from 'react';
import { chatApi } from '../services/chat';
import type { ChatMessage } from '../types/chat';

export interface DisplayMessage {
  id: string;
  sender: string;
  content: string;
  type: 'info' | 'good' | 'executing' | 'planning' | 'user' | 'aura' | 'error';
  timestamp: number;
}

const BOOT_SEQUENCE = [
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

  const addMessage = useCallback((
    sender: DisplayMessage['sender'],
    content: string,
    type: DisplayMessage['type']
  ) => {
    const message: DisplayMessage = {
      id: crypto.randomUUID(),
      sender,
      content,
      type,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, message]);
    return message;
  }, []);

  // Effect to run the bootup animation on initial mount
  useEffect(() => {
    setMessages([]);
    setIsBooting(true);
    const timeouts: NodeJS.Timeout[] = [];
    let messageIndex = 0;

    const showNextMessage = () => {
      if (messageIndex < BOOT_SEQUENCE.length) {
        const msg = BOOT_SEQUENCE[messageIndex];
        addMessage(msg.sender, msg.content, msg.type);
        messageIndex++;

        if (messageIndex < BOOT_SEQUENCE.length) {
          timeouts.push(setTimeout(showNextMessage, msg.delay));
        } else {
          // After last message, wait its delay then stop booting
          timeouts.push(setTimeout(() => setIsBooting(false), msg.delay));
        }
      }
    };

    timeouts.push(setTimeout(showNextMessage, 300));

    return () => {
      timeouts.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once

  // Effect to add the project prompt AFTER booting, if no project is active
  useEffect(() => {
    if (!isBooting && !activeProject) {
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage || lastMessage.content !== PROJECT_PROMPT) {
        addMessage('SYSTEM', PROJECT_PROMPT, 'info');
      }
    }
  }, [isBooting, activeProject, messages, addMessage]);

  const sendMessage = useCallback(async (userInput: string) => {
    if (!activeProject || !userInput.trim() || isProcessing) {
      return;
    }

    addMessage('user', userInput, 'user');

    const userMessage: ChatMessage = { role: 'user', content: userInput };
    const historyForApi = [...conversationHistory, userMessage];

    setIsProcessing(true);

    try {
      const response = await chatApi.sendPrompt(activeProject, userInput, historyForApi);

      const aiContent = response.message || 'Task received and processed.';
      addMessage('aura', aiContent, 'aura');

      const assistantMessage: ChatMessage = { role: 'assistant', content: aiContent };
      setConversationHistory([...historyForApi, assistantMessage]);
    } catch (error) {
      addMessage('system',
        `Error: ${error instanceof Error ? error.message : 'Failed to send message'}`,
        'error'
      );
      // On error, still update history with the user's message so it's not lost
      setConversationHistory(historyForApi);
    } finally {
      setIsProcessing(false);
    }
  }, [activeProject, conversationHistory, isProcessing, addMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationHistory([]);
  }, []);

  return {
    messages,
    isProcessing,
    isBooting,
    sendMessage,
    addMessage,
    clearMessages
  };
};