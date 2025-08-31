// src/hooks/useProjects.ts
import { useState, useEffect } from 'react';
import { projectsApi } from '../services/projects';

export const useProjects = () => {
  const [projects, setProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await projectsApi.getProjects();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (name: string) => {
    const sanitizedName = name.trim().toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .substring(0, 50);

    if (!sanitizedName) {
      throw new Error('Please enter a valid project name');
    }

    await projectsApi.createProject(sanitizedName);
    await loadProjects();
    return sanitizedName;
  };

  const deleteProject = async (name: string) => {
    await projectsApi.deleteProject(name);
    await loadProjects();
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return {
    projects,
    loading,
    error,
    loadProjects,
    createProject,
    deleteProject
  };
};