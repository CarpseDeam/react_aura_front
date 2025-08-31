import { API_BASE_URL, getAuthHeaders } from './api';
import type { ChatMessage } from '../types/chat';

export const agentApi = {
  async sendPrompt(projectName: string, prompt: string, history: ChatMessage[] = []) {
    const response = await fetch(`${API_BASE_URL}/agent/projects/${projectName}/prompt`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        prompt: prompt,
        history: history
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to send prompt: ${response.status}`);
    }

    return response.json();
  },

  async stopMission(projectName: string) {
    const response = await fetch(`${API_BASE_URL}/agent/projects/${projectName}/stop`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to stop mission: ${response.status}`);
    }

    return response.json();
  }
};