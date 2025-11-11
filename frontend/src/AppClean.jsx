import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AlertProvider } from './hooks/useAlert';
import CleanSidebar from './components/Layout/CleanSidebar';
import Home from './components/Home/Home';
import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';
import ForgotPassword from './components/Auth/ForgotPassword';
import Dashboard from './components/Dashboard/Dashboard';
import ProfileNew from './components/Profile/ProfileNew';
import AdminDashboard from './components/Admin/AdminDashboard';
import Reports from './components/Reports/Reports';
import Transactions from './components/Transactions/Transactions';
import Budget from './components/Budget/Budget';
import SavingsGoals from './components/SavingsGoals/SavingsGoals';
import FinancialHealthAnalysis from './components/FinancialHealth/FinancialHealthAnalysis';
import CleanTrends from './components/Trends/CleanTrends';
import CleanMonthlySpending from './components/Trends/CleanMonthlySpending';
import CleanCategoryAnalysis from './components/Trends/CleanCategoryAnalysis';
import CleanSavingsGrowth from './components/Trends/CleanSavingsGrowth';
import Export from './components/Export/Export';
import FinancialInsights from './components/Insights/FinancialInsights';
import Alert from './components/Common/Alert';
import ErrorBoundary from './components/Common/ErrorBoundary';
import './styles/clean-layout.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div style={{ padding: '2rem' }}>Checking authentication...</div>;
  return isAuthenticated ? children : <Navigate to="/signin" />;
};

// Admin Protected Route Component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/signin" />;
  }
  
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="app-container">
      <CleanSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={setSidebarCollapsed}
        isAuthenticated={isAuthenticated}
      />
      
      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
        <Alert />
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* Auth Routes */}
          <Route path="/signin" element={
            <PublicRoute><SignIn /></PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute><SignUp /></PublicRoute>
          } />
          <Route path="/forgot-password" element={
            <PublicRoute><ForgotPassword /></PublicRoute>
          } />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/transactions" element={
            <ProtectedRoute><Transactions /></ProtectedRoute>
          } />
          <Route path="/budgets" element={
            <ProtectedRoute><Budget /></ProtectedRoute>
          } />
          <Route path="/savings-goals" element={
            <ProtectedRoute><SavingsGoals /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><ProfileNew /></ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute><Reports /></ProtectedRoute>
          } />
          <Route path="/financial-health" element={
            <ProtectedRoute><FinancialHealthAnalysis /></ProtectedRoute>
          } />
          
          {/* Trends Routes */}
          <Route path="/trends" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <CleanTrends />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          <Route path="/trends/monthly-spending" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <CleanMonthlySpending />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          <Route path="/trends/category-analysis" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <CleanCategoryAnalysis />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          <Route path="/trends/savings-growth" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <CleanSavingsGrowth />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          
          {/* Other Routes */}
          <Route path="/export" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <Export />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute><AdminDashboard /></AdminRoute>
          } />
        </Routes>
      </main>
    </div>
  );
}

function AppClean() {
  return (
    <AuthProvider>
      <AlertProvider>
        <Router>
          <AppContent />
        </Router>
      </AlertProvider>
    </AuthProvider>
  );
}

export default AppClean;