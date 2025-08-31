// src/services/projects.ts
import { API_BASE_URL, getAuthHeaders } from './api';

export const projectsApi = {
  async getProjects() {
    const response = await fetch(`${API_BASE_URL}/api/missions`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to load projects');
    }
    return response.json();
  },

  async createProject(projectName: string) {
    const response = await fetch(`${API_BASE_URL}/api/missions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ project_name: projectName })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to create project: ${response.status}`);
    }
    return response.json();
  },

  async deleteProject(projectName: string) {
    const response = await fetch(`${API_BASE_URL}/api/missions/${projectName}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to delete project: ${response.status}`);
    }
  }
};