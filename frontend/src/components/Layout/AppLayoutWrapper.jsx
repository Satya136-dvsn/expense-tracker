import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import CleanSidebar from './CleanSidebar';
import MobileNavigation from './MobileNavigation';
import './AppLayoutWrapper.css';

const AppLayoutWrapper = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on pages that shouldn't show sidebar
  const isHomePage = location.pathname === '/';
  const isAuthPage = ['/signin', '/signup', '/forgot-password'].includes(location.pathname);
  const showSidebar = isAuthenticated && !isHomePage && !isAuthPage;

  // Handle mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setSidebarCollapsed(false); // Reset collapsed state on mobile
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="app-layout-wrapper">
      {showSidebar && (
        <>
          {/* Mobile Menu Button */}
          {isMobile && (
            <button 
              className="mobile-menu-btn glass-button secondary"
              onClick={toggleSidebar}
              aria-label="Toggle navigation menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          {/* Sidebar */}
          <div className={`sidebar-container ${
            isMobile ? (mobileMenuOpen ? 'mobile-open' : 'mobile-hidden') : 
            (sidebarCollapsed ? 'collapsed' : 'expanded')
          }`}>
            <CleanSidebar 
              collapsed={!isMobile && sidebarCollapsed} 
              onToggle={toggleSidebar}
              isAuthenticated={isAuthenticated}
            />
          </div>

          {/* Mobile Navigation */}
          {isMobile && (
            <MobileNavigation 
              isOpen={mobileMenuOpen}
              onClose={closeMobileMenu}
            />
          )}
        </>
      )}

      {/* Main Content */}
      <main className={`main-content ${
        showSidebar ? 
          (isMobile ? 'with-mobile-sidebar' : 
           (sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded')) : 
          'full-width'
      }`}>
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayoutWrapper;