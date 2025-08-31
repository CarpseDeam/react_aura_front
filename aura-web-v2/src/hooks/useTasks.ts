// src/hooks/useTasks.ts
import { useState, useEffect, useCallback } from 'react';
import { tasksApi } from '../services/tasks';

// This is the shape of the data coming from the backend API
export interface ApiTask {
  id: number;
  description: string;
  done: boolean;
  last_error: string | null;
}

// This is the shape we want to use in our components
export interface Task {
  id: number;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

const transformApiTask = (apiTask: ApiTask): Task => ({
  id: apiTask.id,
  description: apiTask.description,
  status: apiTask.done ? 'completed' : (apiTask.last_error ? 'failed' : 'pending'),
});

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
      const apiTasks: ApiTask[] = await tasksApi.getTasks(activeProject);
      const transformedTasks = apiTasks.map(transformApiTask);
      setTasks(transformedTasks);
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
      const newTaskFromApi: ApiTask = await tasksApi.addTask(activeProject, description);
      setTasks(prevTasks => [...prevTasks, transformApiTask(newTaskFromApi)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add task');
    }
  }, [activeProject]);

  const updateTask = useCallback(async (taskId: number, description: string) => {
    if (!activeProject) return;

    try {
      const updatedTaskFromApi: ApiTask = await tasksApi.updateTask(activeProject, taskId.toString(), description);
      setTasks(prevTasks => prevTasks.map(task => (task.id === taskId ? transformApiTask(updatedTaskFromApi) : task)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  }, [activeProject]);

  const deleteTask = useCallback(async (taskId: number) => {
    if (!activeProject) return;

    try {
      await tasksApi.deleteTask(activeProject, taskId.toString());
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