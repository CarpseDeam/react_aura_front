import { API_BASE_URL, getAuthHeaders } from './api';

export interface ModelAssignment {
  role_name: string;
  model_id: string;
  temperature: number;
}

export interface ModelAssignmentUpdate {
  assignments: ModelAssignment[];
}

export interface ModelAssignmentList {
  assignments: ModelAssignment[];
}

export interface AvailableModels {
  models: Record<string, string[]>;
}

export const assignmentsApi = {
  async getAvailableModels(): Promise<AvailableModels> {
    const response = await fetch(`${API_BASE_URL}/api/assignments/available-models`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get available models: ${response.status}`);
    }

    return response.json();
  },

  async getAssignments(): Promise<ModelAssignmentList> {
    const response = await fetch(`${API_BASE_URL}/api/assignments`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get model assignments: ${response.status}`);
    }

    return response.json();
  },

  async updateAssignments(assignmentsData: ModelAssignmentUpdate): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/assignments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(assignmentsData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to update model assignments: ${response.status}`);
    }
  }
};