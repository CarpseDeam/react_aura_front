import { apiClient } from './api';
import type { Task } from '../types/task'; // It's good practice to define your types

export const tasksApi = {
  async getTasks(projectName: string) {
    return apiClient<Task[]>(`/api/missions/${projectName}/tasks`);
  },

  async addTask(projectName: string, description: string) {
    return apiClient<Task>(`/api/missions/${projectName}/tasks`, {
      method: 'POST',
      body: JSON.stringify({ description })
    });
  },

  async updateTask(projectName: string, taskId: string, description: string) {
    return apiClient<Task>(`/api/missions/${projectName}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify({ description })
    });
  },

  async deleteTask(projectName: string, taskId: string) {
    return apiClient<void>(`/api/missions/${projectName}/tasks/${taskId}`, { method: 'DELETE' });
  },

  async dispatchMission(projectName: string) {
    return apiClient<{ message: string }>(`/agent/projects/dispatch`, {
      method: 'POST',
      body: JSON.stringify({ project_name: projectName })
    });
  }
};