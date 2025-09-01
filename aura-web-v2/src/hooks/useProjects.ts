import { useState, useEffect, useCallback } from 'react';
import { projectsApi } from '../services/projects';

export const useProjects = () => {
  const [projects, setProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true); // Start in loading state
  const [error, setError] = useState('');

  const loadProjects = useCallback(async () => {
    // Don't set loading to true here if it's already true on initial load
    setError('');

    try {
      const projectData = await projectsApi.getProjects();
      setProjects(Array.isArray(projectData) ? projectData : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const createProject = async (projectName: string): Promise<string> => {
    try {
      await projectsApi.createProject(projectName);
      // Sanitize the project name for local optimism, but refetch for truth
      const sanitizedName = projectName.toLowerCase().replace(/[^a-z0-9-_]/g, '_');
      await loadProjects(); // Refetch the list from the server
      setError('');
      return sanitizedName;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteProject = async (projectName: string) => {
    try {
      await projectsApi.deleteProject(projectName);
      await loadProjects(); // Refetch the list from the server
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete project';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    projects,
    loading,
    error,
    createProject,
    deleteProject,
    refetch: loadProjects
  };
};