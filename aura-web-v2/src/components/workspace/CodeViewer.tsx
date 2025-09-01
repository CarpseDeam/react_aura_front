import { useState, useEffect } from 'react';
import { filesService } from '../../services/files';
import { getWebSocketService } from '../../services/websocket';
import { StreamingCodeRenderer } from './StreamingCodeRenderer';
import './CodeViewer.css';

interface CodeViewerProps {
  activeProject: string | null;
  selectedFile: string | null;
}

interface OpenTab {
  filePath: string;
  fileName: string;
  content: string;
  language: string;
  modified: boolean;
}

export const CodeViewer = ({ activeProject, selectedFile }: CodeViewerProps) => {
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [streamingFile, setStreamingFile] = useState<string | null>(null);

  // Effect to handle file selection from the tree
  useEffect(() => {
    if (selectedFile && activeProject) {
      openFile(selectedFile);
    }
  }, [selectedFile, activeProject]);

  // Effect to handle real-time code streaming from the agent
  useEffect(() => {
    const ws = getWebSocketService();

    const handleCodeStream = (message: any) => {
      if (message.type === 'code_stream_chunk' && message.content) {
        const { filePath, chunk } = message.content;

        setOpenTabs(prevTabs => {
          const existingTab = prevTabs.find(tab => tab.filePath === filePath);

          if (streamingFile !== filePath) {
            // This is the first chunk for this file, overwrite content
            setStreamingFile(filePath);
            if (existingTab) {
              return prevTabs.map(tab => 
                tab.filePath === filePath ? { ...tab, content: chunk, modified: true } : tab
              );
            } else {
              const fileName = filePath.split('/').pop() || filePath;
              const language = filesService.getLanguageFromExtension(fileName);
              const newTab: OpenTab = { filePath, fileName, content: chunk, language, modified: true };
              return [...prevTabs, newTab];
            }
          } else {
            // This is a subsequent chunk, append content
            if (existingTab) {
              return prevTabs.map(tab =>
                tab.filePath === filePath ? { ...tab, content: tab.content + chunk, modified: true } : tab
              );
            } else {
              // This case should ideally not happen if streamingFile is set correctly
              const fileName = filePath.split('/').pop() || filePath;
              const language = filesService.getLanguageFromExtension(fileName);
              const newTab: OpenTab = { filePath, fileName, content: chunk, language, modified: true };
              return [...prevTabs, newTab];
            }
          }
        });

        // Automatically switch to the tab being updated
        setActiveTab(filePath);
      }
    };

    const unsubscribe = ws.on('code_stream_chunk', handleCodeStream);

    return () => {
      unsubscribe();
    };
  }, [streamingFile]); // Rerun when streamingFile changes

  const openFile = async (filePath: string) => {
    if (!activeProject) return;

    const existingTab = openTabs.find(tab => tab.filePath === filePath);
    if (existingTab) {
      setActiveTab(filePath);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const content = await filesService.getFileContent(activeProject, filePath);
      const fileName = filePath.split('/').pop() || filePath;
      const language = filesService.getLanguageFromExtension(fileName);

      const newTab: OpenTab = { filePath, fileName, content, language, modified: false };

      setOpenTabs(prev => [...prev, newTab]);
      setActiveTab(filePath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file');
    } finally {
      setLoading(false);
    }
  };

  const closeTab = (filePath: string) => {
    setOpenTabs(prev => prev.filter(tab => tab.filePath !== filePath));
    if (activeTab === filePath) {
      const remainingTabs = openTabs.filter(tab => tab.filePath !== filePath);
      setActiveTab(remainingTabs.length > 0 ? remainingTabs[remainingTabs.length - 1].filePath : null);
    }
  };

  const getActiveTabContent = () => {
    return openTabs.find(tab => tab.filePath === activeTab);
  };

  const renderLineNumbers = (content: string) => {
    const lines = content.split('\n');
    return lines.map((_, index) => (
      <div key={index} className="line-number">{index + 1}</div>
    ));
  };

  const activeTabContent = getActiveTabContent();

  return (
    <div className="code-viewer">
      <div className="code-tabs">
        {openTabs.map(tab => (
          <div
            key={tab.filePath}
            className={`code-tab ${activeTab === tab.filePath ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.filePath)}
          >
            <span className="tab-icon">{filesService.getLanguageFromExtension(tab.fileName) === 'python' ? '🐍' : '📄'}</span>
            <span className="tab-name">{tab.fileName}</span>
            {tab.modified && <span className="tab-modified">●</span>}
            <button
              className="tab-close"
              onClick={(e) => { e.stopPropagation(); closeTab(tab.filePath); }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="code-content">
        {loading ? (
          <div className="code-loading">Loading file...</div>
        ) : error ? (
          <div className="code-error">{error}</div>
        ) : !activeProject ? (
          <div className="code-welcome"><h3>Welcome to AURA Workspace</h3><p>Load a project and select a file to start coding</p></div>
        ) : !activeTabContent ? (
          <div className="code-welcome"><h3>No file selected</h3><p>Select a file from the explorer to view its contents</p></div>
        ) : (
          <div className="code-editor">
            <div className="code-header">
              <span className="code-file-path">{activeTabContent.filePath}</span>
              <span className="code-language">{activeTabContent.language}</span>
            </div>
            <div className="code-body">
              <div className="line-numbers">
                {renderLineNumbers(activeTabContent.content)}
              </div>
              <div className="code-text">
                <StreamingCodeRenderer 
                  content={activeTabContent.content} 
                  language={activeTabContent.language} 
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};