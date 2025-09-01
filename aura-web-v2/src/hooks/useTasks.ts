import { useState, useEffect, useCallback, useRef } from 'react';
import { tasksApi } from '../services/tasks';
import type { Task } from '../types/task';
import { getWebSocketService } from '../services/websocket';
import type { WebSocketMessage } from '../services/websocket';

export const useTasks = (activeProject: string | null) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dispatching, setDispatching] = useState(false);
  const isInitialCheckDone = useRef(false);

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

  // A ref to hold the latest loadTasks function.
  // This avoids adding loadTasks as a dependency to the WebSocket useEffect,
  // which can cause unnecessary re-subscriptions.
  const loadTasksRef = useRef(loadTasks);
  useEffect(() => {
    loadTasksRef.current = loadTasks;
  }, [loadTasks]);

  // Effect to check the initial agent status when the component mounts or project changes
  useEffect(() => {
    if (!activeProject) {
      setDispatching(false);
      isInitialCheckDone.current = true;
      return;
    }

    // Reset for the new project
    isInitialCheckDone.current = false;
    setDispatching(true); // Assume it might be running until we confirm

    const checkInitialStatus = async () => {
      try {
        const status = await tasksApi.getAgentStatus(activeProject);
        setDispatching(status.is_running);
      } catch (err) {
        console.error("Failed to fetch initial agent status:", err);
        setDispatching(false); // On error, default to not dispatching
      } finally {
        // This is the crucial gate. No WebSocket messages will be processed until this is true.
        isInitialCheckDone.current = true;
      }
    };

    checkInitialStatus();
  }, [activeProject]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // WebSocket integration for real-time updates
  useEffect(() => {
    if (!activeProject) {
      return;
    }

    const webSocketService = getWebSocketService();

    const handleTaskUpdate = () => {
      loadTasksRef.current();
    };

    const handleAgentStatus = (message: WebSocketMessage) => {
      // The gate: Do not process WebSocket status until the initial API check is done.
      if (!isInitialCheckDone.current) return;

      if (message.type === 'agent_status') {
        if (message.status === 'thinking' || message.status === 'executing') {
          setDispatching(true);
        } else if (message.status === 'idle') {
          setDispatching(false);
          loadTasksRef.current(); // Refresh tasks when agent is done
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
  }, [activeProject]); // Dependency array is now safer

  const addTask = async (description: string) => {
    if (!activeProject) return;

    try {
      await tasksApi.addTask(activeProject, description);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add task');
    }
  };

  const updateTask = async (taskId: number, description: string) => {
    if (!activeProject) return;

    try {
      await tasksApi.updateTask(activeProject, taskId.toString(), description);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const deleteTask = async (taskId: number) => {
    if (!activeProject) return;

    try {
      await tasksApi.deleteTask(activeProject, taskId.toString());
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const dispatchMission = async () => {
    if (!activeProject) return;

    setError('');
    try {
      // Set dispatching true immediately for better UX
      setDispatching(true);
      await tasksApi.dispatchMission(activeProject);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to dispatch mission');
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