// src/components/mission/TaskList.tsx
import { useState } from 'react';
import { useTasks } from '../../hooks/useTasks';

interface TaskListProps {
  activeProject: string | null;
  isBooting: boolean;
}

export const TaskList = ({ activeProject, isBooting }: TaskListProps) => {
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const {
    tasks,
    loading,
    error,
    dispatching,
    addTask,
    deleteTask,
    dispatchMission
  } = useTasks(activeProject);

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
              />
            ))
          )}
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
      </div>

      <button
        className="dispatch-button"
        onClick={handleDispatch}
        disabled={isBooting || !activeProject || dispatching || tasks.length === 0}
      >
        {dispatching ? 'DISPATCHING...' : 'DISPATCH AURA'}
      </button>
    </div>
  );
};

// Individual Task Item Component
interface TaskItemProps {
  task: { id: string; description: string; status: string };
  onDelete: () => void;
}

const TaskItem = ({ task, onDelete }: TaskItemProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✓';
      case 'in_progress': return '⏳';
      case 'failed': return '❌';
      default: return '○';
    }
  };

  return (
    <div className={`task-item ${task.status}`}>
      <span className="task-status">
        {getStatusIcon(task.status)}
      </span>
      <span className="task-text">{task.description}</span>
      <button
        className="task-delete"
        onClick={onDelete}
        title="Delete task"
      >
        ×
      </button>
    </div>
  );
};