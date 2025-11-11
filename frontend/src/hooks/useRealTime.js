import { useEffect, useRef, useState } from 'react';
import websocketService from '../services/websocketService';

/**
 * Custom hook for real-time data updates
 * Manages WebSocket connection and provides real-time data to components
 */
export const useRealTime = () => {
  const [connected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastUpdate, setLastUpdate] = useState(null);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      connectWebSocket(token);
    }

    // Listen for WebSocket events
    const handleUpdate = (event) => {
      setLastUpdate(event.detail);
    };

    const handleSystemUpdate = (event) => {
      console.log('System update received:', event.detail);
    };

    const handleConnectionFailed = () => {
      setConnected(false);
      setConnectionStatus('failed');
    };

    window.addEventListener('websocket-update', handleUpdate);
    window.addEventListener('websocket-system-update', handleSystemUpdate);
    window.addEventListener('websocket-connection-failed', handleConnectionFailed);

    return () => {
      window.removeEventListener('websocket-update', handleUpdate);
      window.removeEventListener('websocket-system-update', handleSystemUpdate);
      window.removeEventListener('websocket-connection-failed', handleConnectionFailed);
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      websocketService.disconnect();
    };
  }, []);

  const connectWebSocket = async (token) => {
    try {
      setConnectionStatus('connecting');
      await websocketService.connect(token);
      setConnected(true);
      setConnectionStatus('connected');
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      setConnected(false);
      setConnectionStatus('failed');
      
      // Retry connection after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket(token);
      }, 5000);
    }
  };

  const subscribe = (type, handler) => {
    switch (type) {
      case 'dashboard':
        websocketService.subscribeToDashboard(handler);
        break;
      case 'transactions':
        websocketService.subscribeToTransactions(handler);
        break;
      case 'analytics':
        websocketService.subscribeToAnalytics(handler);
        break;
      case 'investments':
        websocketService.subscribeToInvestments(handler);
        break;
      case 'bills':
        websocketService.subscribeToBills(handler);
        break;
      case 'notifications':
        websocketService.subscribeToNotifications(handler);
        break;
      case 'currency':
        websocketService.subscribeToCurrencyRates(handler);
        break;
      default:
        console.warn('Unknown subscription type:', type);
    }
  };

  const send = (destination, message) => {
    return websocketService.send(destination, message);
  };

  return {
    connected,
    connectionStatus,
    lastUpdate,
    subscribe,
    send,
    reconnect: () => {
      const token = localStorage.getItem('token');
      if (token) {
        connectWebSocket(token);
      }
    }
  };
};

/**
 * Hook for subscribing to specific real-time updates
 */
export const useRealTimeSubscription = (type, handler) => {
  const { connected, subscribe } = useRealTime();

  useEffect(() => {
    if (connected && handler) {
      subscribe(type, handler);
    }
  }, [connected, type, handler, subscribe]);

  return { connected };
};

/**
 * Hook for dashboard real-time updates
 */
export const useDashboardRealTime = (onUpdate) => {
  return useRealTimeSubscription('dashboard', onUpdate);
};

/**
 * Hook for transaction real-time updates
 */
export const useTransactionRealTime = (onUpdate) => {
  return useRealTimeSubscription('transactions', onUpdate);
};

/**
 * Hook for analytics real-time updates
 */
export const useAnalyticsRealTime = (onUpdate) => {
  return useRealTimeSubscription('analytics', onUpdate);
};

/**
 * Hook for investment real-time updates
 */
export const useInvestmentRealTime = (onUpdate) => {
  return useRealTimeSubscription('investments', onUpdate);
};

/**
 * Hook for bill reminder real-time updates
 */
export const useBillRealTime = (onUpdate) => {
  return useRealTimeSubscription('bills', onUpdate);
};

/**
 * Hook for notification real-time updates
 */
export const useNotificationRealTime = (onUpdate) => {
  return useRealTimeSubscription('notifications', onUpdate);
};

/**
 * Hook for currency rate real-time updates
 */
export const useCurrencyRealTime = (onUpdate) => {
  return useRealTimeSubscription('currency', onUpdate);
};