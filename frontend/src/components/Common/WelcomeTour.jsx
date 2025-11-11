import React, { useState, useEffect } from 'react';
// import { GlassCard, GlassButton } from '../Glass';
import './WelcomeTour.css';

const WelcomeTour = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const tourSteps = [
    {
      title: "Welcome to BudgetWise! 🎉",
      content: "Your comprehensive financial management platform with AI-powered insights, community features, and professional planning tools.",
      highlight: "dashboard",
      action: "Let's explore your new financial companion!"
    },
    {
      title: "AI-Powered Insights 🤖",
      content: "Get personalized financial recommendations, spending anomaly detection, and predictive analytics to make smarter money decisions.",
      highlight: "ai-link",
      action: "Discover intelligent financial guidance"
    },
    {
      title: "Investment Tracking 📈",
      content: "Monitor your portfolio performance with real-time market data, risk analysis, and professional investment insights.",
      highlight: "investments-link",
      action: "Track your investment journey"
    },
    {
      title: "Financial Planning 🎯",
      content: "Plan for retirement, optimize debt payoff strategies, and manage tax planning with advanced calculators and scenario analysis.",
      highlight: "planning-link",
      action: "Build your financial future"
    },
    {
      title: "Community & Learning 👥",
      content: "Connect with other users, share financial tips, ask questions, and learn from a community of financially-minded individuals.",
      highlight: "community-link",
      action: "Join the financial community"
    },
    {
      title: "You're All Set! ✨",
      content: "Explore all features at your own pace. Your financial data is secure, and all tools are designed to help you achieve your goals.",
      highlight: null,
      action: "Start your financial journey"
    }
  ];

  useEffect(() => {
    // Check if user has seen the tour before
    const hasSeenTour = localStorage.getItem('budgetwise-tour-completed');
    if (!hasSeenTour) {
      setIsVisible(true);
    }
  }, []);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const skipTour = () => {
    completeTour();
  };

  const completeTour = () => {
    localStorage.setItem('budgetwise-tour-completed', 'true');
    setIsVisible(false);
    if (onComplete) {
      onComplete();
    }
  };

  if (!isVisible) return null;

  const currentTourStep = tourSteps[currentStep];

  return (
    <div className="welcome-tour-overlay">
      <div className="welcome-tour-backdrop" onClick={skipTour} />
      
      <div className="welcome-tour-container">
        <div className="professional-card welcome-tour-card">
          <div className="tour-header">
            <div className="tour-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                />
              </div>
              <span className="progress-text">
                {currentStep + 1} of {tourSteps.length}
              </span>
            </div>
            <button className="tour-close" onClick={skipTour}>×</button>
          </div>

          <div className="tour-content">
            <h2 className="tour-title">{currentTourStep.title}</h2>
            <p className="tour-description">{currentTourStep.content}</p>
          </div>

          <div className="tour-actions">
            {currentStep > 0 && (
              <button 
                className="professional-btn professional-btn-secondary"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Previous
              </button>
            )}
            
            <div className="tour-action-right">
              <button className="tour-skip" onClick={skipTour}>
                Skip Tour
              </button>
              <button className="professional-btn professional-btn-primary" onClick={nextStep}>
                {currentStep === tourSteps.length - 1 ? 'Get Started' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Highlight overlay for specific elements */}
      {currentTourStep.highlight && (
        <div className={`tour-highlight tour-highlight-${currentTourStep.highlight}`} />
      )}
    </div>
  );
};

export default WelcomeTour;