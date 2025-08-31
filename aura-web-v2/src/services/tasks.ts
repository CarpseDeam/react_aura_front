// src/services/tasks.ts
import { API_BASE_URL, getAuthHeaders } from './api';

export const tasksApi = {
  async getTasks(projectName: string) {
    const response = await fetch(`${API_BASE_URL}/api/missions/${projectName}/tasks`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to load tasks: ${response.status}`);
    }

    return response.json();
  },

  async addTask(projectName: string, description: string) {
    const response = await fetch(`${API_BASE_URL}/api/missions/${projectName}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ description })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to add task: ${response.status}`);
    }

    return response.json();
  },

  async updateTask(projectName: string, taskId: string, description: string) {
    const response = await fetch(`${API_BASE_URL}/api/missions/${projectName}/tasks/${taskId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ description })
    });

    if (!response.ok) {
      throw new Error(`Failed to update task: ${response.status}`);
    }

    return response.json();
  },

  async deleteTask(projectName: string, taskId: string) {
    const response = await fetch(`${API_BASE_URL}/api/missions/${projectName}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to delete task: ${response.status}`);
    }
  },

  async dispatchMission(projectName: string) {
    const response = await fetch(`${API_BASE_URL}/agent/projects/dispatch`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ project_name: projectName })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to dispatch mission: ${response.status}`);
    }

    return response.json();
  }
};