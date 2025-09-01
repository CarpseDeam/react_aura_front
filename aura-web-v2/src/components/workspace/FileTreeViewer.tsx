// src/components/workspace/FileTreeViewer.tsx
import { useState, useEffect } from 'react';
import { filesService, type FileNode } from '../../services/files';
import './FileTreeViewer.css';

interface FileTreeViewerProps {
  activeProject: string | null;
  onFileSelect: (filePath: string) => void;
  selectedFile?: string;
}

export const FileTreeViewer = ({ activeProject, onFileSelect, selectedFile }: FileTreeViewerProps) => {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (activeProject) {
      loadFileTree();
    } else {
      setFileTree([]);
    }
  }, [activeProject]);

  const loadFileTree = async () => {
    if (!activeProject) return;

    setLoading(true);
    setError('');

    try {
      const tree = await filesService.getFileTree(activeProject);
      setFileTree(tree);
      // Auto-expand root level directories
      const rootDirs = tree.filter(node => node.type === 'directory').map(node => node.path);
      setExpandedDirs(new Set(rootDirs));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file tree');
    } finally {
      setLoading(false);
    }
  };

  const toggleDirectory = (path: string) => {
    const newExpanded = new Set(expandedDirs);
    if (expandedDirs.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedDirs(newExpanded);
  };

  const handleFileClick = (node: FileNode) => {
    if (node.type === 'file') {
      onFileSelect(node.path);
    } else {
      toggleDirectory(node.path);
    }
  };

  const getFileIcon = (node: FileNode) => {
    if (node.type === 'directory') {
      return expandedDirs.has(node.path) ? '📂' : '📁';
    }

    const ext = node.name.split('.').pop()?.toLowerCase();
    const iconMap: { [key: string]: string } = {
      'js': '🟨',
      'ts': '🔷',
      'tsx': '🔷',
      'jsx': '🟨',
      'py': '🐍',
      'java': '☕',
      'cpp': '🔧',
      'c': '🔧',
      'html': '🌐',
      'css': '🎨',
      'scss': '🎨',
      'json': '📋',
      'md': '📝',
      'txt': '📄',
      'yml': '⚙️',
      'yaml': '⚙️',
      'sh': '🖥️',
      'sql': '🗃️'
    };

    return iconMap[ext || ''] || '📄';
  };

  const renderFileTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map((node) => (
      <div key={node.path} className="file-tree-node">
        <div
          className={`file-tree-item ${node.type} ${selectedFile === node.path ? 'selected' : ''}`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => handleFileClick(node)}
        >
          <span className="file-icon">{getFileIcon(node)}</span>
          <span className="file-name">{node.name}</span>
        </div>
        {node.type === 'directory' && expandedDirs.has(node.path) && node.children && (
          <div className="file-tree-children">
            {renderFileTree(node.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="file-tree-viewer">
      <div className="file-tree-header">
        <h3>EXPLORER</h3>
        {activeProject && (
          <button className="refresh-button" onClick={loadFileTree} disabled={loading}>
            🔄
          </button>
        )}
      </div>

      <div className="file-tree-content">
        {loading ? (
          <div className="file-tree-loading">Loading files...</div>
        ) : error ? (
          <div className="file-tree-error">{error}</div>
        ) : !activeProject ? (
          <div className="file-tree-empty">No project loaded</div>
        ) : fileTree.length === 0 ? (
          <div className="file-tree-empty">No files found</div>
        ) : (
          <div className="file-tree-list">
            {renderFileTree(fileTree)}
          </div>
        )}
      </div>
    </div>
  );
};