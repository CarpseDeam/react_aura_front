// src/components/system/SystemLog.tsx
import { useState, useEffect, useRef } from 'react';
import { getWebSocketService } from '../../services/websocket';
import type { WebSocketMessage } from '../../services/websocket';
import './SystemLog.css';

interface SystemLogProps {
  activeProject: string | null;
  isVisible: boolean;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'system_log' | 'agent_status' | 'error';
}

export const SystemLog = ({ activeProject, isVisible }: SystemLogProps) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    if (!activeProject) {
      setLogs([]);
      return;
    }

    const webSocketService = getWebSocketService();

    const handleSystemLog = (message: WebSocketMessage) => {
      if (message.type === 'system_log' && message.content) {
        const newLog: LogEntry = {
          id: `${Date.now()}-${Math.random()}`,
          timestamp: new Date(),
          message: message.content,
          type: 'system_log'
        };
        setLogs(prev => [...prev.slice(-49), newLog]); // Keep last 50 logs
      }
    };

    const handleAgentStatus = (message: WebSocketMessage) => {
      if (message.type === 'agent_status' && message.status) {
        const statusMessage = message.status === 'thinking' ? 'AURA is thinking...' :
                             message.status === 'executing' ? 'AURA is executing commands...' :
                             message.status === 'idle' ? 'AURA is idle' : 
                             `AURA status: ${message.status}`;
        
        const newLog: LogEntry = {
          id: `status-${Date.now()}`,
          timestamp: new Date(),
          message: statusMessage,
          type: 'agent_status'
        };
        setLogs(prev => [...prev.slice(-49), newLog]);
      }
    };

    const handleError = (message: WebSocketMessage) => {
      if (message.type === 'error' && message.content) {
        const newLog: LogEntry = {
          id: `error-${Date.now()}`,
          timestamp: new Date(),
          message: `ERROR: ${message.content}`,
          type: 'error'
        };
        setLogs(prev => [...prev.slice(-49), newLog]);
      }
    };

    const unsubscribeSystemLog = webSocketService.on('system_log', handleSystemLog);
    const unsubscribeAgentStatus = webSocketService.on('agent_status', handleAgentStatus);
    const unsubscribeError = webSocketService.on('error', handleError);

    return () => {
      unsubscribeSystemLog();
      unsubscribeAgentStatus();
      unsubscribeError();
    };
  }, [activeProject]);

  const clearLogs = () => {
    setLogs([]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (!isVisible) return null;

  return (
    <div className={`system-log ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="system-log-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="system-log-title">
          🧠 AURA SYSTEM LOG ({logs.length})
        </span>
        <div className="system-log-controls">
          <button className="clear-logs-btn" onClick={(e) => { e.stopPropagation(); clearLogs(); }}>
            Clear
          </button>
          <span className="expand-icon">{isExpanded ? '▼' : '▲'}</span>
        </div>
      </div>
      
      {isExpanded && (
        <div className="system-log-content">
          {logs.length === 0 ? (
            <div className="no-logs">No system messages yet. Start a mission to see AURA's thought process.</div>
          ) : (
            <div className="log-entries">
              {logs.map(log => (
                <div key={log.id} className={`log-entry ${log.type}`}>
                  <span className="log-time">[{formatTime(log.timestamp)}]</span>
                  <span className="log-message">{log.message}</span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};