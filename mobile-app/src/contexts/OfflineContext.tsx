import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { databaseService } from '../services/databaseService';
import { apiService } from '../services/apiService';

interface OfflineContextType {
  isOnline: boolean;
  syncData: () => Promise<void>;
  queueTransaction: (transaction: any) => Promise<void>;
  getPendingSyncCount: () => Promise<number>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

interface OfflineProviderProps {
  children: ReactNode;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected && state.isInternetReachable;
      setIsOnline(online || false);
      
      // Auto-sync when coming back online
      if (online) {
        syncData();
      }
    });

    return unsubscribe;
  }, []);

  const syncData = async () => {
    try {
      if (!isOnline) return;

      // Get pending transactions from local database
      const pendingTransactions = await databaseService.getPendingTransactions();
      
      // Sync each pending transaction
      for (const transaction of pendingTransactions) {
        try {
          await apiService.createTransaction(transaction);
          await databaseService.markTransactionSynced(transaction.id);
        } catch (error) {
          console.error('Failed to sync transaction:', error);
        }
      }

      // Fetch latest data from server
      const latestData = await apiService.getDashboardData();
      await databaseService.updateLocalData(latestData);
      
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const queueTransaction = async (transaction: any) => {
    // Add to local database with pending status
    const localTransaction = {
      ...transaction,
      id: `local_${Date.now()}`,
      synced: false,
      createdAt: new Date().toISOString(),
    };

    await databaseService.addTransaction(localTransaction);

    // Try to sync immediately if online
    if (isOnline) {
      try {
        const syncedTransaction = await apiService.createTransaction(transaction);
        await databaseService.updateTransaction(localTransaction.id, {
          ...syncedTransaction,
          synced: true,
        });
      } catch (error) {
        console.error('Failed to sync transaction immediately:', error);
      }
    }
  };

  const getPendingSyncCount = async () => {
    return await databaseService.getPendingSyncCount();
  };

  const value: OfflineContextType = {
    isOnline,
    syncData,
    queueTransaction,
    getPendingSyncCount,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = (): OfflineContextType => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};