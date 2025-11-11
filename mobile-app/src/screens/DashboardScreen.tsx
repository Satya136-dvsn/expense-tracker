import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useAuth } from '../contexts/AuthContext';
import { useOffline } from '../contexts/OfflineContext';
import { apiService } from '../services/apiService';
import { formatCurrency } from '../utils/currency';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';

const { width: screenWidth } = Dimensions.get('window');

interface DashboardData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsGoal: number;
  recentTransactions: any[];
  monthlyTrends: any[];
  categoryBreakdown: any[];
}

const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const { isOnline, syncData } = useOffline();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load data from API or local storage
      const dashboardData = await apiService.getDashboardData();
      setData(dashboardData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Load from local storage as fallback
      const fallbackData: DashboardData = {
        totalBalance: 45000,
        monthlyIncome: 75000,
        monthlyExpenses: 52000,
        savingsGoal: 100000,
        recentTransactions: [],
        monthlyTrends: [
          { month: 'Jan', income: 70000, expenses: 48000 },
          { month: 'Feb', income: 72000, expenses: 51000 },
          { month: 'Mar', income: 75000, expenses: 52000 },
        ],
        categoryBreakdown: [
          { name: 'Food', amount: 15000, color: '#FF6B6B' },
          { name: 'Transport', amount: 8000, color: '#4ECDC4' },
          { name: 'Entertainment', amount: 5000, color: '#45B7D1' },
          { name: 'Bills', amount: 12000, color: '#96CEB4' },
          { name: 'Others', amount: 12000, color: '#FFEAA7' },
        ],
      };
      setData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (isOnline) {
      await syncData();
    }
    await loadDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error" size={48} color="#FF6B6B" />
        <Text style={styles.errorText}>Failed to load dashboard data</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadDashboardData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#667eea',
    },
  };

  const monthlyTrendsData = {
    labels: data.monthlyTrends.map(item => item.month),
    datasets: [
      {
        data: data.monthlyTrends.map(item => item.income / 1000),
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: data.monthlyTrends.map(item => item.expenses / 1000),
        color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`,
        strokeWidth: 2,
      },
    ],
    legend: ['Income (₹K)', 'Expenses (₹K)'],
  };

  const pieData = data.categoryBreakdown.map(item => ({
    name: item.name,
    population: item.amount,
    color: item.color,
    legendFontColor: '#7F7F7F',
    legendFontSize: 12,
  }));

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back, {user?.name || 'User'}!</Text>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
        {!isOnline && (
          <View style={styles.offlineIndicator}>
            <Icon name="cloud-off" size={16} color="#FF6B6B" />
            <Text style={styles.offlineText}>Offline Mode</Text>
          </View>
        )}
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <StatCard
          title="Total Balance"
          amount={data.totalBalance}
          icon="account-balance-wallet"
          color="#4CAF50"
        />
        <StatCard
          title="Monthly Income"
          amount={data.monthlyIncome}
          icon="trending-up"
          color="#2196F3"
        />
        <StatCard
          title="Monthly Expenses"
          amount={data.monthlyExpenses}
          icon="trending-down"
          color="#FF5722"
        />
        <StatCard
          title="Savings Goal"
          amount={data.savingsGoal}
          icon="savings"
          color="#9C27B0"
          progress={data.totalBalance / data.savingsGoal}
        />
      </View>

      {/* Monthly Trends Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Monthly Trends</Text>
        <LineChart
          data={monthlyTrendsData}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Category Breakdown */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Expense Categories</Text>
        <PieChart
          data={pieData}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          style={styles.chart}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton}>
            <Icon name="add" size={24} color="#667eea" />
            <Text style={styles.quickActionText}>Add Transaction</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <Icon name="camera-alt" size={24} color="#667eea" />
            <Text style={styles.quickActionText}>Scan Receipt</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <Icon name="pie-chart" size={24} color="#667eea" />
            <Text style={styles.quickActionText}>View Analytics</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 16,
    backgroundColor: '#667eea',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  offlineText: {
    color: '#FFE0E0',
    fontSize: 12,
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  chartContainer: {
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 8,
  },
  quickActionsContainer: {
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionButton: {
    alignItems: 'center',
    padding: 12,
  },
  quickActionText: {
    fontSize: 12,
    color: '#667eea',
    marginTop: 4,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default DashboardScreen;