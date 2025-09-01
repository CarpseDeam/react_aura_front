import { apiClient } from './api';
import type { ChatMessage } from '../types/chat';

export const chatApi = {
  async sendPrompt(projectName: string, prompt: string, history: ChatMessage[] = []) {
    return apiClient<{ message: string }>(`/agent/projects/${projectName}/prompt`, {
      method: 'POST',
      body: JSON.stringify({
        prompt: prompt,
        history: history
      })
    });
  }
};
