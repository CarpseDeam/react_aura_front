// src/services/chat.ts
import { API_BASE_URL, getAuthHeaders } from './api';
import type { ChatMessage } from '../types/chat';

export const chatApi = {
  async sendPrompt(projectName: string, prompt: string, history: ChatMessage[] = []) {
    const response = await fetch(`${API_BASE_URL}/agent/prompt`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        project_name: projectName,
        user_prompt: prompt,
        conversation_history: history
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to send prompt: ${response.status}`);
    }

    return response.json();
  }
};