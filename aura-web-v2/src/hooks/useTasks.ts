// src/hooks/useTasks.ts
import { useState, useEffect, useCallback } from 'react';
import { tasksApi } from '../services/tasks';

export interface Task {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  order?: number;
}

export const useTasks = (activeProject: string | null) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dispatching, setDispatching] = useState(false);

  const loadTasks = useCallback(async () => {
    if (!activeProject) {
      setTasks([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await tasksApi.getTasks(activeProject);
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [activeProject]);

  const addTask = useCallback(async (description: string) => {
    if (!activeProject) return;

    try {
      const newTask = await tasksApi.addTask(activeProject, description);
      setTasks(prevTasks => [...prevTasks, newTask]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add task');
    }
  }, [activeProject]);

  const updateTask = useCallback(async (taskId: string, description: string) => {
    if (!activeProject) return;

    try {
      const updatedTask = await tasksApi.updateTask(activeProject, taskId, description);
      setTasks(prevTasks => prevTasks.map(task => (task.id === taskId ? updatedTask : task)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  }, [activeProject]);

  const deleteTask = useCallback(async (taskId: string) => {
    if (!activeProject) return;

    try {
      await tasksApi.deleteTask(activeProject, taskId);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  }, [activeProject]);

  const dispatchMission = useCallback(async () => {
    if (!activeProject || dispatching) return;

    setDispatching(true);
    setError('');

    try {
      await tasksApi.dispatchMission(activeProject);
      await loadTasks(); // Reload tasks to see status updates
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to dispatch mission');
    } finally {
      setDispatching(false);
    }
  }, [activeProject, dispatching, loadTasks]);

  // Load tasks when active project changes
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return {
    tasks,
    loading,
    error,
    dispatching,
    addTask,
    updateTask,
    deleteTask,
    dispatchMission,
    loadTasks
  };
};