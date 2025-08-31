import { useState, useEffect, useCallback } from 'react';
import { projectsApi } from '../services/projects';

export const useProjects = () => {
  const [projects, setProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const projectData = await projectsApi.getProjects();
      // Assuming the API returns an array of project names
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
      // Sanitize the project name (remove special characters, spaces, etc.)
      const sanitizedName = projectName.toLowerCase().replace(/[^a-z0-9-_]/g, '_');

      // Add to local state
      setProjects(prev => [...prev, sanitizedName]);
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
      // Remove from local state
      setProjects(prev => prev.filter(p => p !== projectName));
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