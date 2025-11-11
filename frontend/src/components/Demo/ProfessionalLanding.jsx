import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfessionalLanding.css';

const ProfessionalLanding = () => {
  const navigate = useNavigate();
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      title: 'Clean Modern Design',
      description: 'Professional UI with clean, minimal aesthetics that impress recruiters',
      icon: '🎨',
      demo: '/demo/dropdown'
    },
    {
      title: 'Advanced Analytics',
      description: 'Sophisticated data visualization with interactive charts and insights',
      icon: '📊',
      demo: '/analytics'
    },
    {
      title: 'Financial Planning',
      description: 'Comprehensive planning tools for budgets, goals, and investments',
      icon: '💰',
      demo: '/planning'
    },
    {
      title: 'Real-time Updates',
      description: 'Live data synchronization with smooth animations and feedback',
      icon: '⚡',
      demo: '/dashboard'
    }
  ];

  const techStack = [
    { name: 'React 18', category: 'Frontend' },
    { name: 'Spring Boot', category: 'Backend' },
    { name: 'PostgreSQL', category: 'Database' },
    { name: 'Chart.js', category: 'Visualization' },
    { name: 'CSS3', category: 'Styling' },
    { name: 'WebSocket', category: 'Real-time' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  const handleGetStarted = () => {
    navigate('/signin');
  };

  const handleViewDemo = (demoPath) => {
    navigate(demoPath);
  };

  return (
    <div className="professional-landing">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              BudgetWise
              <span className="hero-subtitle">Professional Financial Management</span>
            </h1>
            <p className="hero-description">
              A portfolio-quality financial management application showcasing modern UI/UX design, 
              advanced React development, and professional software architecture.
            </p>
            <div className="hero-actions">
              <button className="cta-button primary" onClick={handleGetStarted}>
                <span>Get Started</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12,5 19,12 12,19"/>
                </svg>
              </button>
              <button className="cta-button secondary" onClick={() => handleViewDemo('/demo/dropdown')}>
                <span>View Demo</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polygon points="5,3 19,12 5,21"/>
                </svg>
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="feature-showcase">
              <div className="showcase-card active">
                <div className="card-header">
                  <span className="feature-icon">{features[currentFeature].icon}</span>
                  <h3>{features[currentFeature].title}</h3>
                </div>
                <p>{features[currentFeature].description}</p>
                <button 
                  className="demo-link"
                  onClick={() => handleViewDemo(features[currentFeature].demo)}
                >
                  Try Demo →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <div className="section-content">
          <h2 className="section-title">Key Features</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`feature-card ${index === currentFeature ? 'highlighted' : ''}`}
                onClick={() => handleViewDemo(feature.demo)}
              >
                <div className="feature-icon-large">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <div className="feature-action">
                  <span>Explore →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="tech-section">
        <div className="section-content">
          <h2 className="section-title">Technology Stack</h2>
          <div className="tech-grid">
            {techStack.map((tech, index) => (
              <div key={index} className="tech-item">
                <span className="tech-name">{tech.name}</span>
                <span className="tech-category">{tech.category}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Highlights */}
      <section className="portfolio-section">
        <div className="section-content">
          <h2 className="section-title">Portfolio Highlights</h2>
          <div className="highlights-grid">
            <div className="highlight-card">
              <h3>🎯 Professional Design</h3>
              <p>Clean, modern UI that demonstrates advanced CSS skills and design principles</p>
            </div>
            <div className="highlight-card">
              <h3>⚡ Performance Optimized</h3>
              <p>Efficient React architecture with smooth animations and responsive design</p>
            </div>
            <div className="highlight-card">
              <h3>🔧 Full-Stack Implementation</h3>
              <p>Complete application with Spring Boot backend, PostgreSQL database, and REST APIs</p>
            </div>
            <div className="highlight-card">
              <h3>📱 Mobile Responsive</h3>
              <p>Seamless experience across all devices with touch-optimized interactions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="section-content">
          <h2>Ready to Explore?</h2>
          <p>Experience the full application with demo data and interactive features</p>
          <div className="cta-actions">
            <button className="cta-button primary large" onClick={handleGetStarted}>
              Start Demo
            </button>
            <button className="cta-button secondary large" onClick={() => window.open('https://github.com', '_blank')}>
              View Source
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfessionalLanding;