import { useState } from 'react';
import type { Task } from '../../types/task';

interface TaskItemProps {
  task: Task;
  onDelete: () => void;
  onUpdate?: (description: string) => void;
}

export const TaskItem = ({ task, onDelete, onUpdate }: TaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.description);

  const handleSave = () => {
    if (onUpdate && editValue.trim() !== task.description) {
      onUpdate(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(task.description);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className={`task-item ${task.done ? 'completed' : ''}`}>
      {isEditing ? (
        <div className="task-edit-mode">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyPress={handleKeyPress}
            onBlur={handleSave}
            className="task-edit-input"
            autoFocus
          />
        </div>
      ) : (
        <div className="task-display-mode">
          <span
            className="task-description"
            onClick={() => onUpdate && setIsEditing(true)}
          >
            {task.description}
          </span>
          <div className="task-actions">
            {onUpdate && (
              <button
                className="task-edit-btn"
                onClick={() => setIsEditing(true)}
                title="Edit task"
              >
                ✎
              </button>
            )}
            <button
              className="task-delete-btn"
              onClick={onDelete}
              title="Delete task"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};