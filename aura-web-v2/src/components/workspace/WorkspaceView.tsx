import { useState } from 'react';
import { FileTreeViewer } from './FileTreeViewer';
import { CodeViewer } from './CodeViewer';
import { TaskList } from '../mission/TaskList';
import type { Task } from '../../types/task';
import './WorkspaceView.css';

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

interface WorkspaceViewProps {
  activeProject: string | null;
  isBooting: boolean;
  tasksHook: TasksHook; // The hook's return value is now passed in
}

export const WorkspaceView = ({ activeProject, isBooting, tasksHook }: WorkspaceViewProps) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const { dispatching } = tasksHook; // Get dispatching state from the prop

  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath);
  };

  return (
    <div className="workspace-view">
      <div className="workspace-left-panel">
        <FileTreeViewer
          activeProject={activeProject}
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile || undefined}
        />
      </div>

      <div className="workspace-center-panel">
        {/* The single, consolidated thinking indicator */}
        {dispatching && (
          <div className="workspace-thinking-header">
            <span className="thinking-text">AURA IS EXECUTING MISSION...</span>
            <div className="workspace-thinking-animation">
              <div className="knight-rider-bar"></div>
            </div>
          </div>
        )}
        
        <CodeViewer
          activeProject={activeProject}
          selectedFile={selectedFile}
        />
      </div>

      <div className="workspace-right-panel">
        {/* Pass the entire hook down to the TaskList */}
        <TaskList
          activeProject={activeProject}
          isBooting={isBooting}
          tasksHook={tasksHook}
        />
      </div>
    </div>
  );
};