// src/components/modals/ProjectsModal.tsx
import { useState } from 'react';
import { useProjects } from '../../hooks/useProjects';
import { projectsApi } from '../../services/projects';

interface ProjectsModalProps {
  onClose: () => void;
  onSelectProject: (name: string) => void;
  activeProject: string | null;
}

export const ProjectsModal = ({ onClose, onSelectProject, activeProject }: ProjectsModalProps) => {
  const [newProjectName, setNewProjectName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const { projects, loading, createProject, deleteProject } = useProjects();

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      setError('Project name cannot be empty');
      return;
    }

    setCreating(true);
    setError('');

    try {
      const sanitizedName = await createProject(newProjectName);
      setNewProjectName('');
      onSelectProject(sanitizedName);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleLoadProject = async (projectName: string) => {
    setError('');
    try {
      await projectsApi.load(projectName);
      onSelectProject(projectName);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project');
    }
  };

  const handleDeleteProject = async (projectName: string) => {
    if (!confirm(`Are you sure you want to delete "${projectName}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteProject(projectName);
      if (projectName === activeProject) {
        onSelectProject('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h3>MANAGE PROJECTS</h3>

        {error && (
          <div className="error-message" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div className="project-section">
          <h4>Existing Projects</h4>
          <div className="project-list">
            {loading ? (
              <div className="project-item">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="project-item">No projects found. Create one to get started!</div>
            ) : (
              projects.map(project => (
                <div key={project} className="project-item">
                  <span className="project-name">{project}</span>
                  <div>
                    <button
                      className="project-action load"
                      onClick={() => handleLoadProject(project)}
                    >
                      Load
                    </button>
                    <button
                      className="project-action delete"
                      onClick={() => handleDeleteProject(project)}
                      style={{ marginLeft: '0.5rem' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="project-section">
          <h4>Create New Project</h4>
          <div className="create-project">
            <input
              type="text"
              placeholder="Project name..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !creating && handleCreateProject()}
              disabled={creating}
            />
            <button
              onClick={handleCreateProject}
              disabled={creating}
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
