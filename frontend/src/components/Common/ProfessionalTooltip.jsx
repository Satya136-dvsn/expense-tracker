import React from 'react';
import './ProfessionalTooltip.css';

/**
 * Professional tooltip component with connecting lines and smooth animations
 * @param {Object} props - Component props
 * @param {Object} props.position - Tooltip position {x, y}
 * @param {Object} props.content - Tooltip content {title, value, subtitle}
 * @param {Object} props.lineStart - Line start position {x, y}
 * @param {Object} props.lineEnd - Line end position {x, y}
 * @param {boolean} props.visible - Tooltip visibility
 * @param {string} props.theme - Tooltip theme ('light' or 'dark')
 * @param {number} props.width - Tooltip width (default: 140)
 * @param {number} props.height - Tooltip height (default: 50)
 */
const ProfessionalTooltip = ({
  position = { x: 0, y: 0 },
  content = { title: '', value: '', subtitle: '' },
  lineStart = null,
  lineEnd = null,
  visible = false,
  theme = 'light',
  width = 140,
  height = 50
}) => {
  if (!visible) return null;

  const tooltipX = position.x - width / 2;
  const tooltipY = position.y - height / 2;

  return (
    <g className={`professional-tooltip ${theme}`}>
      {/* Connecting line */}
      {lineStart && lineEnd && (
        <line
          x1={lineStart.x}
          y1={lineStart.y}
          x2={lineEnd.x}
          y2={lineEnd.y}
          className="tooltip-line"
          stroke="#333333"
          strokeWidth="1.5"
          opacity="0.7"
        />
      )}
      
      {/* Tooltip background with shadow */}
      <defs>
        <filter id="tooltip-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="rgba(0,0,0,0.15)" />
        </filter>
      </defs>
      
      <rect
        x={tooltipX}
        y={tooltipY}
        width={width}
        height={height}
        rx="6"
        ry="6"
        fill={theme === 'dark' ? '#1f2937' : 'white'}
        stroke={theme === 'dark' ? '#374151' : '#e2e8f0'}
        strokeWidth="1"
        filter="url(#tooltip-shadow)"
        className="tooltip-background"
      />
      
      {/* Content */}
      {content.title && (
        <text
          x={position.x}
          y={position.y - 8}
          textAnchor="middle"
          className="tooltip-title"
          fill={theme === 'dark' ? '#f9fafb' : '#333333'}
          fontSize="12"
          fontWeight="500"
          fontFamily="Arial, sans-serif"
        >
          {content.title}
        </text>
      )}
      
      {content.value && (
        <text
          x={position.x}
          y={position.y + 8}
          textAnchor="middle"
          className="tooltip-value"
          fill={theme === 'dark' ? '#f9fafb' : '#333333'}
          fontSize="14"
          fontWeight="700"
          fontFamily="Arial, sans-serif"
        >
          {content.value}
        </text>
      )}
      
      {content.subtitle && (
        <text
          x={position.x}
          y={position.y + 22}
          textAnchor="middle"
          className="tooltip-subtitle"
          fill={theme === 'dark' ? '#9ca3af' : '#64748b'}
          fontSize="10"
          fontWeight="400"
          fontFamily="Arial, sans-serif"
        >
          {content.subtitle}
        </text>
      )}
    </g>
  );
};

/**
 * HTML-based tooltip for non-SVG contexts
 */
export const HTMLTooltip = ({
  position = { x: 0, y: 0 },
  content = { title: '', value: '', subtitle: '' },
  visible = false,
  theme = 'light',
  className = ''
}) => {
  if (!visible) return null;

  const style = {
    position: 'absolute',
    left: position.x - 70,
    top: position.y - 25,
    zIndex: 1000,
    pointerEvents: 'none',
    transform: 'translate(-50%, -50%)'
  };

  return (
    <div 
      className={`html-tooltip ${theme} ${className}`}
      style={style}
    >
      <div className="tooltip-content">
        {content.title && (
          <div className="tooltip-title">{content.title}</div>
        )}
        {content.value && (
          <div className="tooltip-value">{content.value}</div>
        )}
        {content.subtitle && (
          <div className="tooltip-subtitle">{content.subtitle}</div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalTooltip;