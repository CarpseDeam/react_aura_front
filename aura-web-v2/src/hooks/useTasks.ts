import { useState, useEffect, useCallback } from 'react';
import { tasksApi } from '../services/tasks';
import type { Task } from '../types/task';

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
      const taskData = await tasksApi.getTasks(activeProject);
      setTasks(taskData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [activeProject]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const addTask = async (description: string) => {
    if (!activeProject) return;

    try {
      const newTask = await tasksApi.addTask(activeProject, description);
      setTasks(prev => [...prev, newTask]);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add task');
    }
  };

  const updateTask = async (taskId: number, description: string) => {
    if (!activeProject) return;

    try {
      const updatedTask = await tasksApi.updateTask(activeProject, taskId.toString(), description);
      setTasks(prev => prev.map(task =>
        task.id === taskId ? updatedTask : task
      ));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const deleteTask = async (taskId: number) => {
    if (!activeProject) return;

    try {
      await tasksApi.deleteTask(activeProject, taskId.toString());
      setTasks(prev => prev.filter(task => task.id !== taskId));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const dispatchMission = async () => {
    if (!activeProject) return;

    setDispatching(true);
    setError('');

    try {
      await tasksApi.dispatchMission(activeProject);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to dispatch mission');
    } finally {
      setDispatching(false);
    }
  };

  return {
    tasks,
    loading,
    error,
    dispatching,
    addTask,
    updateTask,
    deleteTask,
    dispatchMission,
    refetch: loadTasks
  };
};