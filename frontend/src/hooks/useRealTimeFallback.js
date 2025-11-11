// Fallback hooks for real-time functionality
// These provide no-op implementations to prevent import errors

export const useDashboardRealTime = (callback) => {
  // No-op implementation
  return { connected: false };
};

export const useTransactionRealTime = (callback) => {
  // No-op implementation
  return { connected: false };
};

export const useNotificationRealTime = (callback) => {
  // No-op implementation
  return { connected: false };
};

export const useAnalyticsRealTime = (callback) => {
  // No-op implementation
  return { connected: false };
};

export const useInvestmentRealTime = (callback) => {
  // No-op implementation
  return { connected: false };
};

export const useBillRealTime = (callback) => {
  // No-op implementation
  return { connected: false };
};

export const useCurrencyRealTime = (callback) => {
  // No-op implementation
  return { connected: false };
};

export const useRealTime = () => {
  // No-op implementation for the main useRealTime hook
  return {
    connected: false,
    connectionStatus: 'disconnected',
    lastUpdate: null,
    subscribe: () => {},
    send: () => {},
    reconnect: () => {}
  };
};