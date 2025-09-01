// src/components/modals/SettingsModal.tsx
import { useState, useEffect } from 'react';
import { keysApi, type ProviderKey } from '../../services/keys';
import { assignmentsApi, type ModelAssignment, type AvailableModels } from '../../services/assignments';

interface SettingsModalProps {
  onClose: () => void;
}

type TabType = 'keys' | 'models';

const PROVIDERS = [
  { name: 'google', label: 'Google Gemini', placeholder: 'AIza...' },
  { name: 'deepseek', label: 'DeepSeek', placeholder: 'sk-...' },
  { name: 'openai', label: 'OpenAI', placeholder: 'sk-...' },
  { name: 'anthropic', label: 'Anthropic', placeholder: 'sk-ant-...' }
];

const ROLES = [
  { name: 'planner', label: 'Planner', description: 'Handles project planning and architecture' },
  { name: 'coder', label: 'Coder', description: 'Generates and reviews code' },
  { name: 'chat', label: 'Chat', description: 'Handles conversations and questions' }
];

export const SettingsModal = ({ onClose }: SettingsModalProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('keys');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // API Keys state
  const [apiKeys, setApiKeys] = useState<ProviderKey[]>([]);
  const [newKeys, setNewKeys] = useState<Record<string, string>>({});
  
  // Model assignments state
  const [availableModels, setAvailableModels] = useState<AvailableModels>({ models: {} });
  const [assignments, setAssignments] = useState<ModelAssignment[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [keysResponse, assignmentsResponse] = await Promise.all([
        keysApi.getKeys(),
        assignmentsApi.getAssignments()
      ]);
      setApiKeys(keysResponse.keys);
      setAssignments(assignmentsResponse.assignments);
      
      // Load available models if we have API keys
      if (keysResponse.keys.length > 0) {
        const modelsResponse = await assignmentsApi.getAvailableModels();
        setAvailableModels(modelsResponse);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveApiKey = async (provider: string) => {
    const apiKey = newKeys[provider];
    if (!apiKey?.trim()) {
      setError('API key cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await keysApi.createOrUpdateKey({ provider_name: provider, api_key: apiKey });
      setSuccess(`${provider} API key saved successfully`);
      setNewKeys({ ...newKeys, [provider]: '' });
      await loadData(); // Reload to get updated keys and available models
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save API key');
    } finally {
      setLoading(false);
    }
  };

  const deleteApiKey = async (provider: string) => {
    if (!confirm(`Are you sure you want to delete the ${provider} API key?`)) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await keysApi.deleteKey(provider);
      setSuccess(`${provider} API key deleted successfully`);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete API key');
    } finally {
      setLoading(false);
    }
  };

  const updateAssignment = (role: string, field: 'model_id' | 'temperature', value: string | number) => {
    setAssignments(prev => {
      const existing = prev.find(a => a.role_name === role);
      if (existing) {
        return prev.map(a => 
          a.role_name === role 
            ? { ...a, [field]: value }
            : a
        );
      } else {
        return [...prev, { 
          role_name: role, 
          model_id: field === 'model_id' ? value as string : '',
          temperature: field === 'temperature' ? value as number : 0.7 
        }];
      }
    });
  };

  const saveAssignments = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await assignmentsApi.updateAssignments({ assignments });
      setSuccess('Model assignments saved successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save model assignments');
    } finally {
      setLoading(false);
    }
  };

  const getAssignment = (role: string): ModelAssignment => {
    return assignments.find(a => a.role_name === role) || {
      role_name: role,
      model_id: '',
      temperature: 0.7
    };
  };

  const hasApiKey = (provider: string): boolean => {
    return apiKeys.some(key => key.provider_name === provider);
  };

  const getAllModelOptions = () => {
    const options: Array<{ value: string; label: string }> = [];
    Object.entries(availableModels.models).forEach(([provider, models]) => {
      models.forEach(model => {
        options.push({
          value: `${provider}/${model}`,
          label: `${provider} - ${model}`
        });
      });
    });
    return options;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content settings-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h3>AURA SETTINGS</h3>
        
        {error && (
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}
        
        <div className="settings-tabs">
          <button 
            className={`tab ${activeTab === 'keys' ? 'active' : ''}`}
            onClick={() => setActiveTab('keys')}
          >
            API Keys
          </button>
          <button 
            className={`tab ${activeTab === 'models' ? 'active' : ''}`}
            onClick={() => setActiveTab('models')}
          >
            Model Assignments
          </button>
        </div>
        
        <div className="settings-content">
          {activeTab === 'keys' && (
            <div className="keys-section">
              <h4>API Key Configuration</h4>
              <p>Configure your AI provider API keys to enable Aura's capabilities.</p>
              
              {PROVIDERS.map(provider => {
                const hasKey = hasApiKey(provider.name);
                const existingKey = apiKeys.find(k => k.provider_name === provider.name);
                
                return (
                  <div key={provider.name} className="key-config">
                    <div className="key-header">
                      <h5>{provider.label}</h5>
                      {hasKey && (
                        <span className="key-status configured">✓ Configured</span>
                      )}
                    </div>
                    
                    {hasKey && existingKey && (
                      <div className="existing-key">
                        <span className="masked-key">{existingKey.masked_key}</span>
                        <button 
                          className="btn-danger btn-small"
                          onClick={() => deleteApiKey(provider.name)}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                    
                    <div className="key-input">
                      <input
                        type="password"
                        placeholder={hasKey ? 'Enter new key to replace' : provider.placeholder}
                        value={newKeys[provider.name] || ''}
                        onChange={e => setNewKeys({ ...newKeys, [provider.name]: e.target.value })}
                        disabled={loading}
                      />
                      <button 
                        className="btn-primary btn-small"
                        onClick={() => saveApiKey(provider.name)}
                        disabled={loading || !newKeys[provider.name]?.trim()}
                      >
                        {hasKey ? 'Update' : 'Save'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {activeTab === 'models' && (
            <div className="models-section">
              <h4>Model Role Assignments</h4>
              <p>Assign specific AI models to different roles. Configure API keys first to see available models.</p>
              
              {Object.keys(availableModels.models).length === 0 ? (
                <div className="no-models">
                  <p>No models available. Please configure API keys first.</p>
                </div>
              ) : (
                <>
                  {ROLES.map(role => {
                    const assignment = getAssignment(role.name);
                    const modelOptions = getAllModelOptions();
                    
                    return (
                      <div key={role.name} className="role-config">
                        <div className="role-header">
                          <h5>{role.label}</h5>
                          <p className="role-description">{role.description}</p>
                        </div>
                        
                        <div className="role-settings">
                          <div className="setting-group">
                            <label>Model:</label>
                            <select
                              value={assignment.model_id}
                              onChange={e => updateAssignment(role.name, 'model_id', e.target.value)}
                              disabled={loading}
                            >
                              <option value="">Select a model...</option>
                              {modelOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="setting-group">
                            <label>Temperature:</label>
                            <input
                              type="number"
                              min="0"
                              max="2"
                              step="0.1"
                              value={assignment.temperature}
                              onChange={e => updateAssignment(role.name, 'temperature', parseFloat(e.target.value) || 0.7)}
                              disabled={loading}
                            />
                            <small>Controls randomness (0 = focused, 2 = creative)</small>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="save-assignments">
                    <button 
                      className="btn-primary"
                      onClick={saveAssignments}
                      disabled={loading}
                    >
                      Save Model Assignments
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        
        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
          </div>
        )}
      </div>
    </div>
  );
};