import { useState } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { TaskItem } from './TaskItem';
import './TaskList.css';

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
    updateTask,
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
        
        {/* NEW: Thinking animation */}
        {dispatching && (
          <div className="thinking-animation">
            <div className="knight-rider-bar"></div>
          </div>
        )}

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

      <button
        className="dispatch-button"
        onClick={handleDispatch}
        disabled={isBooting || !activeProject || dispatching || tasks.length === 0}
      >
        {dispatching ? 'EXECUTING MISSION...' : 'DISPATCH MISSION'}
      </button>
    </div>
  );
};