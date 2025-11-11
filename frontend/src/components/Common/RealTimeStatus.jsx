import { useRealTime } from '../../hooks/useRealTimeFallback';
import './RealTimeStatus.css';

/**
 * Real-time connection status indicator
 * Shows WebSocket connection status and provides reconnection option
 */
const RealTimeStatus = () => {
  const { connected, connectionStatus, reconnect } = useRealTime();

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return '🟢';
      case 'connecting':
        return '🟡';
      case 'failed':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Live';
      case 'connecting':
        return 'Connecting...';
      case 'failed':
        return 'Failed';
      default:
        return 'Offline';
    }
  };

  const getStatusClass = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'status-connected';
      case 'connecting':
        return 'status-connecting';
      case 'failed':
        return 'status-failed';
      default:
        return 'status-disconnected';
    }
  };

  return (
    <div className={`realtime-status ${getStatusClass()}`}>
      <div className="status-indicator">
        <span className="status-icon">{getStatusIcon()}</span>
        <span className="status-text">{getStatusText()}</span>
      </div>
      
      {connectionStatus === 'failed' && (
        <button 
          className="reconnect-btn"
          onClick={reconnect}
          title="Reconnect to live updates"
        >
          🔄 Retry
        </button>
      )}
      
      {connected && (
        <div className="live-indicator">
          <div className="pulse-dot"></div>
          <span className="live-text">LIVE</span>
        </div>
      )}
    </div>
  );
};

export default RealTimeStatus;