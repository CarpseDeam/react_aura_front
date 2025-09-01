import { useState } from 'react';
import { TaskItem } from './TaskItem';
import type { Task } from '../../types/task';
import './TaskList.css';

// Define the shape of the object returned by the useTasks hook
interface TasksHook {
  tasks: Task[];
  loading: boolean;
  error: string;
  dispatching: boolean;
  addTask: (description: string) => Promise<void>;
  updateTask: (taskId: number, description: string) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  dispatchMission: () => Promise<void>;
}

interface TaskListProps {
  activeProject: string | null;
  isBooting: boolean;
  tasksHook: TasksHook;
}

export const TaskList = ({ activeProject, isBooting, tasksHook }: TaskListProps) => {
  const [newTaskDescription, setNewTaskDescription] = useState('');
  
  const {
    tasks,
    loading,
    error,
    dispatching,
    addTask,
    updateTask,
    deleteTask,
    dispatchMission
  } = tasksHook;

  const handleAddTask = async () => {
    if (!newTaskDescription.trim()) {
      setNewTaskDescription('New Task - Edit me!');
    }
    await addTask(newTaskDescription || 'New Task - Edit me!');
    setNewTaskDescription('');
  };

  const handleDispatch = async () => {
    if (tasks.length === 0) {
      alert('No tasks to execute. Add some tasks first.');
      return;
    }
    if (confirm('Start mission execution? This will begin autonomous task processing.')) {
      await dispatchMission();
    }
  };

  return (
    <div className="mission-control-panel">
      <h3>MISSION CONTROL</h3>

      {error && (
        <div className="error-message" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div className="task-section">
        <h4>Current Tasks ({tasks.length})</h4>
        <div className="task-list">
          {loading ? (
            <div className="task-item">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="task-item">
              {activeProject ? 'No tasks assigned' : 'No active project loaded'}
            </div>
          ) : (
            tasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onDelete={() => deleteTask(task.id)}
                onUpdate={(description) => updateTask(task.id, description)}
              />
            ))
          )}
        </div>
      </div>

      <div className="add-task-section">
        <input
          type="text"
          placeholder="Describe a new task..."
          value={newTaskDescription}
          onChange={(e) => setNewTaskDescription(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
          disabled={isBooting || !activeProject}
          className="task-input"
        />
        <button
          className="add-task-button"
          onClick={handleAddTask}
          disabled={isBooting || !activeProject}
        >
          + Add Task
        </button>
      </div>

      {/* The button text is now static. The disabled state provides sufficient feedback. */}
      <button
        className="dispatch-button"
        onClick={handleDispatch}
        disabled={isBooting || !activeProject || dispatching || tasks.length === 0}
      >
        DISPATCH MISSION
      </button>
    </div>
  );
};