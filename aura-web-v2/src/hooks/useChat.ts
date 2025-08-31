// src/hooks/useChat.ts
import { useState, useCallback } from 'react';
import { chatApi } from '../services/chat';
import type { ChatMessage } from '../types/chat';

export interface DisplayMessage {
  id: string;
  sender: 'user' | 'aura' | 'system';
  content: string;
  type: 'info' | 'good' | 'executing' | 'planning' | 'user' | 'aura';
  timestamp: number;
}

export const useChat = (activeProject: string | null) => {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);

  const addMessage = useCallback((
    sender: DisplayMessage['sender'],
    content: string,
    type: DisplayMessage['type'] = 'info'
  ) => {
    const message: DisplayMessage = {
      id: `${Date.now()}-${Math.random()}`,
      sender,
      content,
      type,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, message]);
    return message;
  }, []);

  const sendMessage = useCallback(async (userInput: string) => {
    if (!activeProject || !userInput.trim() || isProcessing) {
      return;
    }

    // Add user message to display
    addMessage('user', userInput, 'user');

    // Add to conversation history for context
    const newHistory = [...conversationHistory, { role: 'user' as const, content: userInput }];
    setConversationHistory(newHistory);

    setIsProcessing(true);

    try {
      const response = await chatApi.sendPrompt(activeProject, userInput, conversationHistory);

      // Add AI response to display
      addMessage('aura', response.message || 'Task received and processed.', 'aura');

      // Update conversation history
      setConversationHistory(prev => [...prev, {
        role: 'assistant' as const,
        content: response.message || 'Task received and processed.'
      }]);

    } catch (error) {
      addMessage('system',
        `Error: ${error instanceof Error ? error.message : 'Failed to send message'}`,
        'info'
      );
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
    sendMessage,
    addMessage,
    clearMessages
  };
};