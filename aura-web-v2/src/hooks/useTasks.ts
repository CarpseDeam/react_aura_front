import { useState, useEffect, useCallback } from 'react';
import { tasksApi } from '../services/tasks';
import type { Task } from '../types/task';
import { getWebSocketService, WebSocketMessage } from '../services/websocket';

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

  // WebSocket integration for real-time updates
  useEffect(() => {
    if (!activeProject) {
      setDispatching(false);
      return;
    }

    const webSocketService = getWebSocketService();

    const handleTaskUpdate = () => {
      loadTasks();
    };

    const handleAgentStatus = (message: WebSocketMessage) => {
      if (message.type === 'agent_status') {
        if (message.status === 'thinking' || message.status === 'executing') {
          setDispatching(true);
        } else if (message.status === 'idle') {
          setDispatching(false);
          loadTasks(); // Refresh tasks when agent is done
        }
      }
    };

    const unsubscribeTasks = webSocketService.on('tasks_updated', handleTaskUpdate);
    const unsubscribeAgent = webSocketService.on('agent_status', handleAgentStatus);
    const unsubscribeMission = webSocketService.on('mission_completed', handleTaskUpdate);

    return () => {
      unsubscribeTasks();
      unsubscribeAgent();
      unsubscribeMission();
    };
  }, [activeProject, loadTasks]);

  const addTask = async (description: string) => {
    if (!activeProject) return;

    try {
      // The backend will send a websocket event, which will trigger a reload.
      await tasksApi.addTask(activeProject, description);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add task');
    }
  };

  const updateTask = async (taskId: number, description: string) => {
    if (!activeProject) return;

    try {
      // The backend will send a websocket event, which will trigger a reload.
      await tasksApi.updateTask(activeProject, taskId.toString(), description);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const deleteTask = async (taskId: number) => {
    if (!activeProject) return;

    try {
      // The backend will send a websocket event, which will trigger a reload.
      await tasksApi.deleteTask(activeProject, taskId.toString());
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const dispatchMission = async () => {
    if (!activeProject) return;

    setError('');
    // The UI will now update via agent_status websocket events.
    try {
      await tasksApi.dispatchMission(activeProject);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to dispatch mission');
      setDispatching(false); // Reset if the initial dispatch fails
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