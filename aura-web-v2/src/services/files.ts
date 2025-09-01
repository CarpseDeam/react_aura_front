// src/services/files.ts
import { apiClient } from './api';

export interface FileNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: FileNode[];
}

class FilesService {
  async getFileTree(projectName: string): Promise<FileNode[]> {
    try {
      return await apiClient<FileNode[]>(`/agent/projects/workspace/${projectName}/files`);
    } catch (error) {
      console.error('Error fetching file tree:', error);
      throw error;
    }
  }

  async getFileContent(projectName: string, filePath: string): Promise<string> {
    try {
      const response = await apiClient<{ content: string }>(`/agent/projects/workspace/${projectName}/file?path=${encodeURIComponent(filePath)}`);
      return response.content;
    } catch (error) {
      console.error('Error fetching file content:', error);
      throw error;
    }
  }

  getLanguageFromExtension(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'jsx': 'javascript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'xml': 'xml',
      'yml': 'yaml',
      'yaml': 'yaml',
      'md': 'markdown',
      'txt': 'text',
      'sh': 'bash',
      'sql': 'sql'
    };
    return languageMap[ext || ''] || 'text';
  }
}

export const filesService = new FilesService();