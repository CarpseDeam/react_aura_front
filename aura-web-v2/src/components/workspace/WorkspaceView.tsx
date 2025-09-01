// src/components/workspace/WorkspaceView.tsx
import { useState } from 'react';
import { FileTreeViewer } from './FileTreeViewer';
import { CodeViewer } from './CodeViewer';
import { TaskList } from '../mission/TaskList';
import { SystemLog } from '../system/SystemLog';
import { useTasks } from '../../hooks/useTasks';
import './WorkspaceView.css';

interface WorkspaceViewProps {
  activeProject: string | null;
  isBooting: boolean;
}

export const WorkspaceView = ({ activeProject, isBooting }: WorkspaceViewProps) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const { dispatching } = useTasks(activeProject);

  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath);
  };

  return (
    <div className="workspace-view">
      {/* Prominent thinking indicator at top */}
      {dispatching && (
        <div className="workspace-thinking-header">
          <span className="thinking-text">AURA IS EXECUTING MISSION...</span>
          <div className="workspace-thinking-animation">
            <div className="knight-rider-bar"></div>
          </div>
        </div>
      )}
      
      <div className="workspace-content">
        <div className="workspace-left-panel">
          <FileTreeViewer
            activeProject={activeProject}
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile || undefined}
          />
        </div>

        <div className="workspace-center-panel">
          <CodeViewer
            activeProject={activeProject}
            selectedFile={selectedFile}
          />
        </div>

        <div className="workspace-right-panel">
          <TaskList
            activeProject={activeProject}
            isBooting={isBooting}
          />
        </div>
      </div>
      
      {/* System Log - shows AURA's thought process */}
      <SystemLog 
        activeProject={activeProject}
        isVisible={!!activeProject}
      />
    </div>
  );
};