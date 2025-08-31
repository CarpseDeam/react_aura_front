// src/components/modals/SettingsModal.tsx
interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal = ({ onClose }: SettingsModalProps) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h3>SETTINGS</h3>
        <div className="settings-section">
          <h4>API Configuration</h4>
          <p>API key management and model assignments will go here...</p>
          <p>For now, this is just a placeholder modal.</p>
        </div>
      </div>
    </div>
  );
};