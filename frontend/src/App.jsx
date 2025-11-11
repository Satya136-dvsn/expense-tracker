import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AlertProvider } from './hooks/useAlert';
import { initProfessionalAnimations } from './utils/animations';
// import { removeDemoElements } from './utils/removeDemoElements';

// Import Dark Blue Glassmorphism Theme
import './styles/dark-blue-glassmorphism-theme.css';
// Import Project-Wide Glassmorphism Integration
import './styles/project-wide-glassmorphism-integration.css';
// Import Global Glassmorphism Override (Final Layer)
import './styles/global-glassmorphism-override.css';
import './App.css';
import AppLayoutWrapper from './components/Layout/AppLayoutWrapper';
import CleanHome from './components/Home/CleanHome';
import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';
import ForgotPassword from './components/Auth/ForgotPassword';
import CleanDashboard from './components/Dashboard/CleanDashboard';
import ProfileNew from './components/Profile/ProfileNew';
import AdminDashboard from './components/Admin/AdminDashboard';
import Reports from './components/Reports/Reports';
import Transactions from './components/Transactions/Transactions';
import Budget from './components/Budget/Budget';
// import SavingsGoals from './components/SavingsGoals/SavingsGoals'; // Now included in FinancialPlanner
import FinancialHealthAnalysis from './components/FinancialHealth/FinancialHealthAnalysis';
import CleanTrends from './components/Trends/CleanTrends';
import MonthlySpendingResponsive from './components/Trends/MonthlySpendingResponsive';
import CleanCategoryAnalysis from './components/Trends/CleanCategoryAnalysis';
import SavingsGrowthResponsive from './components/Trends/SavingsGrowthResponsive';
import Export from './components/Export/Export';
// Lazy load heavy components for better performance
const AnalyticsDashboard = React.lazy(() => import('./components/Analytics/AnalyticsDashboard'));
const BillsDashboard = React.lazy(() => import('./components/Bills').then(module => ({ default: module.BillsDashboard })));
const NotificationCenter = React.lazy(() => import('./components/Notifications').then(module => ({ default: module.NotificationCenter })));
const AIDashboard = React.lazy(() => import('./components/AI').then(module => ({ default: module.AIDashboard })));
const CommunityHub = React.lazy(() => import('./components/Community').then(module => ({ default: module.CommunityHub })));
const InvestmentDashboard = React.lazy(() => import('./components/Investment').then(module => ({ default: module.InvestmentDashboard })));
const FinancialPlanner = React.lazy(() => import('./components/Planning/FinancialPlanner'));
import UserProfile from './components/Profile/UserProfile';
// import RealTimeStatus from './components/Common/RealTimeStatus'; // Removed as requested
import RealTimeToast from './components/Common/RealTimeToast';

import RetirementCalculator from './components/Planning/RetirementCalculator';
import DebtOptimizer from './components/Planning/DebtOptimizer';
import TaxPlanner from './components/Planning/TaxPlanner';
import CurrencyDashboard from './components/Currency/CurrencyDashboard';
import BankIntegration from './components/Banking/BankIntegration';
import Alert from './components/Common/Alert';
import ErrorBoundary from './components/Common/ErrorBoundary';
import CleanDropdownDemo from './components/Common/CleanDropdownDemo';
// import DropdownTestSimple from './components/Common/DropdownTestSimple';
// Layout and accessibility styles
import './styles/layout-fallback.css';
import './styles/accessibility.css';
import './styles/simple-dropdown-fix.css';
import './styles/unified-layout-system.css';

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
  const location = useLocation();
  
  // Check if we're on the home page
  const isHomePage = location.pathname === '/';

  return (
    <AppLayoutWrapper>
      <Alert />
      {isAuthenticated && !isHomePage && (
        <>
          <RealTimeToast />
        </>
      )}
        <Routes>
          <Route path="/" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <CleanHome />
          } />
          
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
            <ProtectedRoute><CleanDashboard /></ProtectedRoute>
          } />
          <Route path="/transactions" element={
            <ProtectedRoute><Transactions /></ProtectedRoute>
          } />
          <Route path="/budgets" element={
            <ProtectedRoute><Budget /></ProtectedRoute>
          } />
          <Route path="/savings-goals" element={
            <Navigate to="/planning" replace />
          } />
          <Route path="/profile" element={
            <ProtectedRoute><ProfileNew /></ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute><UserProfile /></ProtectedRoute>
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
                <MonthlySpendingResponsive />
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
                <SavingsGrowthResponsive />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          
          {/* Analytics Route */}
          <Route path="/analytics" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading Analytics...</div>}>
                  <AnalyticsDashboard />
                </Suspense>
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          
          {/* Bills Routes */}
          <Route path="/bills" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading Bills...</div>}>
                  <BillsDashboard />
                </Suspense>
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          
          {/* Notifications Route */}
          <Route path="/notifications" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <NotificationCenter />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          
          {/* AI Routes */}
          <Route path="/ai" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading AI Dashboard...</div>}>
                  <AIDashboard />
                </Suspense>
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          
          {/* Community Routes */}
          <Route path="/community" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading Community...</div>}>
                  <CommunityHub />
                </Suspense>
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          
          {/* Investment Routes */}
          <Route path="/investments" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading Investments...</div>}>
                  <InvestmentDashboard />
                </Suspense>
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          
          {/* Financial Planning Routes */}
          <Route path="/planning" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading Financial Planning...</div>}>
                  <FinancialPlanner />
                </Suspense>
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          <Route path="/planning/retirement" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <RetirementCalculator />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          <Route path="/planning/debt" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <DebtOptimizer />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          <Route path="/planning/tax" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <TaxPlanner />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          
          {/* Currency Routes */}
          <Route path="/currencies" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <CurrencyDashboard />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          
          {/* Bank Integration Routes */}
          <Route path="/banking" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <BankIntegration />
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
          
          {/* Demo Routes */}
          <Route path="/demo/dropdown" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <CleanDropdownDemo />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute><AdminDashboard /></AdminRoute>
          } />
        </Routes>
    </AppLayoutWrapper>
  );
}

function App() {
  useEffect(() => {
    // Apply both theme classes for compatibility
    document.body.classList.add('theme-glass');
    document.body.classList.add('glassmorphism-theme');
    
    // Initialize professional animations after component mount
    const timer = setTimeout(() => {
      try {
        initProfessionalAnimations();
      } catch (error) {
        console.log('Animation init error:', error);
      }
    }, 100);
    
    // Apply glassmorphism theme to body and root elements
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.classList.add('glassmorphism-app-root');
    }
    
    return () => {
      clearTimeout(timer);
      document.body.classList.remove('theme-glass');
      document.body.classList.remove('glassmorphism-theme');
      if (rootElement) {
        rootElement.classList.remove('glassmorphism-app-root');
      }
    };
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <AlertProvider>
          <Router>
            <div className="glassmorphism-app-wrapper">
              <AppContent />
            </div>
          </Router>
        </AlertProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;