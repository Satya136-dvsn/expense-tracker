import React, { useState, useEffect } from 'react';
import { validateAppHealth, validatePerformance, validateResponsiveness } from '../../utils/appValidation';
// import { GlassCard, GlassButton } from '../Glass';

const AppHealthCheck = ({ onClose }) => {
  const [healthResults, setHealthResults] = useState(null);
  const [performanceResults, setPerformanceResults] = useState(null);
  const [responsivenessResults, setResponsivenessResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const runHealthCheck = async () => {
    setIsRunning(true);
    
    try {
      // Run validation tests
      const health = validateAppHealth();
      const performance = validatePerformance();
      const responsiveness = validateResponsiveness();
      
      setHealthResults(health);
      setPerformanceResults(performance);
      setResponsivenessResults(responsiveness);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PASS': return '#10b981';
      case 'FAIL': return '#ef4444';
      case 'WARNING': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '2rem'
    }}>
      <div className="professional-card" style={{ 
        maxWidth: '800px', 
        width: '100%', 
        maxHeight: '90vh', 
        overflow: 'auto',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: 'rgba(255, 255, 255, 0.95)', margin: 0 }}>
            🔍 BudgetWise Health Check
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            ×
          </button>
        </div>

        {isRunning ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255, 255, 255, 0.8)' }}>
            <div style={{ marginBottom: '1rem' }}>🔄 Running health checks...</div>
          </div>
        ) : (
          <>
            {/* Application Health */}
            {healthResults && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: 'rgba(255, 255, 255, 0.9)', marginBottom: '1rem' }}>
                  Application Health
                </h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '2rem', color: '#10b981' }}>{healthResults.passed}</div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>Passed</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '2rem', color: '#ef4444' }}>{healthResults.failed}</div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>Failed</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '2rem', color: '#f59e0b' }}>{healthResults.warnings}</div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>Warnings</div>
                  </div>
                </div>
                
                <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                  {healthResults.tests.map((test, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.5rem',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{test.name}</span>
                      <span style={{ 
                        color: getStatusColor(test.status),
                        fontWeight: 'bold',
                        fontSize: '0.875rem'
                      }}>
                        {test.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Performance Metrics */}
            {performanceResults && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: 'rgba(255, 255, 255, 0.9)', marginBottom: '1rem' }}>
                  Performance Metrics
                </h3>
                <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>
                  <div>Scripts loaded: {performanceResults.metrics.scriptCount || 'N/A'}</div>
                  <div>Total images: {performanceResults.metrics.totalImages || 0}</div>
                  <div>Lazy loaded images: {performanceResults.metrics.lazyImages || 0}</div>
                </div>
                {performanceResults.recommendations.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <strong style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Recommendations:</strong>
                    <ul style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                      {performanceResults.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Responsiveness */}
            {responsivenessResults && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: 'rgba(255, 255, 255, 0.9)', marginBottom: '1rem' }}>
                  Responsiveness Check
                </h3>
                <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>
                  <div>Current width: {responsivenessResults.breakpoints.mobile?.width || window.innerWidth}px</div>
                  {Object.entries(responsivenessResults.breakpoints).map(([name, data]) => (
                    <div key={name}>
                      {name}: {data.matches ? '✅ Active' : '❌ Inactive'}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="professional-btn professional-btn-secondary" onClick={runHealthCheck}>
                Re-run Tests
              </button>
              <button className="professional-btn professional-btn-primary" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AppHealthCheck;