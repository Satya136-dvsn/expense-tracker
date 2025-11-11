import React from 'react';
import { Link } from 'react-router-dom';

const CleanHome = () => {
  return (
    <div className="page-container">
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '1200px',
          width: '100%'
        }}>
          {/* Main Hero Content */}
          <div style={{
            marginBottom: '4rem'
          }}>
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: '800',
              marginBottom: '1.5rem',
              lineHeight: '1.2'
            }}>
              Master Your Financial Future
            </h1>
            <p style={{
              fontSize: '1.25rem',
              marginBottom: '2rem',
              opacity: 0.9,
              maxWidth: '600px',
              margin: '0 auto 2rem auto',
              lineHeight: '1.6'
            }}>
              Experience the most intuitive and powerful budget tracking platform designed to transform how you manage your money.
            </p>
            
            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '4rem'
            }}>
              <Link 
                to="/signup" 
                className="professional-btn"
                style={{
                  background: 'white',
                  color: '#667eea',
                  fontSize: '1.1rem',
                  padding: '1rem 2rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                🚀 Start Your Journey
              </Link>
              <Link 
                to="/signin" 
                className="professional-btn"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '2px solid rgba(255,255,255,0.3)',
                  fontSize: '1.1rem',
                  padding: '1rem 2rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                🔐 Welcome Back
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="professional-grid professional-grid-4" style={{
            gap: '2rem',
            marginTop: '4rem'
          }}>
            <FeatureCard
              icon="📊"
              title="Smart Analytics"
              description="Advanced insights to understand your spending patterns with beautiful visualizations"
            />
            <FeatureCard
              icon="🐷"
              title="Goal Achievement"
              description="Set personalized savings goals and track your progress with intelligent recommendations"
            />
            <FeatureCard
              icon="📱"
              title="Mobile First"
              description="Seamlessly manage your finances across all devices with our responsive design"
            />
            <FeatureCard
              icon="🔒"
              title="Bank-Grade Security"
              description="Your financial data is protected with enterprise-level encryption and security"
            />
          </div>

          {/* Stats Section */}
          <div style={{
            marginTop: '4rem',
            padding: '3rem 0',
            borderTop: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div className="professional-grid professional-grid-3" style={{
              gap: '2rem',
              textAlign: 'center'
            }}>
              <div>
                <div style={{
                  fontSize: '3rem',
                  fontWeight: '800',
                  marginBottom: '0.5rem'
                }}>
                  10K+
                </div>
                <div style={{
                  fontSize: '1.1rem',
                  opacity: 0.8
                }}>
                  Happy Users
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: '3rem',
                  fontWeight: '800',
                  marginBottom: '0.5rem'
                }}>
                  ₹50M+
                </div>
                <div style={{
                  fontSize: '1.1rem',
                  opacity: 0.8
                }}>
                  Money Managed
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: '3rem',
                  fontWeight: '800',
                  marginBottom: '0.5rem'
                }}>
                  99.9%
                </div>
                <div style={{
                  fontSize: '1.1rem',
                  opacity: 0.8
                }}>
                  Uptime
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Sections */}
      <div style={{
        background: 'white',
        padding: '4rem 2rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '1rem'
          }}>
            Why Choose BudgetWise?
          </h2>
          <p style={{
            fontSize: '1.1rem',
            color: '#64748b',
            marginBottom: '3rem',
            maxWidth: '600px',
            margin: '0 auto 3rem auto'
          }}>
            Join thousands of users who have transformed their financial lives with our comprehensive platform.
          </p>

          <div className="professional-grid professional-grid-3" style={{
            gap: '2rem',
            marginTop: '3rem'
          }}>
            <BenefitCard
              icon="💡"
              title="Intelligent Insights"
              description="Get personalized recommendations based on your spending habits and financial goals."
            />
            <BenefitCard
              icon="⚡"
              title="Lightning Fast"
              description="Experience blazing fast performance with real-time updates and instant synchronization."
            />
            <BenefitCard
              icon="🎯"
              title="Goal-Oriented"
              description="Set and achieve your financial goals with our smart tracking and milestone system."
            />
          </div>

          {/* CTA Section */}
          <div style={{
            marginTop: '4rem',
            padding: '3rem',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            borderRadius: '20px',
            border: '2px solid #e2e8f0'
          }}>
            <h3 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '1rem'
            }}>
              Ready to Take Control?
            </h3>
            <p style={{
              fontSize: '1.1rem',
              color: '#64748b',
              marginBottom: '2rem'
            }}>
              Start your financial journey today with our free account.
            </p>
            <Link 
              to="/signup" 
              className="professional-btn professional-btn-primary"
              style={{
                fontSize: '1.1rem',
                padding: '1rem 2rem',
                textDecoration: 'none'
              }}
            >
              Get Started Free →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }) => (
  <div style={{
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '2rem',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.2)',
    transition: 'all 0.3s ease'
  }}
  onMouseEnter={(e) => {
    e.target.style.background = 'rgba(255,255,255,0.15)';
    e.target.style.transform = 'translateY(-4px)';
  }}
  onMouseLeave={(e) => {
    e.target.style.background = 'rgba(255,255,255,0.1)';
    e.target.style.transform = 'translateY(0)';
  }}>
    <div style={{
      fontSize: '3rem',
      marginBottom: '1rem'
    }}>
      {icon}
    </div>
    <h3 style={{
      fontSize: '1.25rem',
      fontWeight: '700',
      marginBottom: '1rem',
      color: 'white'
    }}>
      {title}
    </h3>
    <p style={{
      fontSize: '0.9rem',
      opacity: 0.9,
      lineHeight: '1.5'
    }}>
      {description}
    </p>
  </div>
);

// Benefit Card Component
const BenefitCard = ({ icon, title, description }) => (
  <div className="professional-card" style={{
    textAlign: 'center',
    transition: 'all 0.3s ease'
  }}
  onMouseEnter={(e) => {
    e.target.style.transform = 'translateY(-4px)';
    e.target.style.boxShadow = '0 12px 32px rgba(0,0,0,0.15)';
  }}
  onMouseLeave={(e) => {
    e.target.style.transform = 'translateY(0)';
    e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
  }}>
    <div style={{
      fontSize: '3rem',
      marginBottom: '1rem'
    }}>
      {icon}
    </div>
    <h3 style={{
      fontSize: '1.25rem',
      fontWeight: '700',
      marginBottom: '1rem',
      color: '#1f2937'
    }}>
      {title}
    </h3>
    <p style={{
      fontSize: '0.9rem',
      color: '#64748b',
      lineHeight: '1.5'
    }}>
      {description}
    </p>
  </div>
);

export default CleanHome;