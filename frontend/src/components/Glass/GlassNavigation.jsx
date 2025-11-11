import React from 'react';
import { NavLink } from 'react-router-dom';
import './GlassNavigation.css';

const GlassNavigation = ({ 
  items = [],
  orientation = 'vertical',
  className = '',
  ...props 
}) => {
  const navClasses = [
    'pro-nav',
    `pro-nav-${orientation}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <nav className={navClasses} {...props}>
      {items.map((item, index) => (
        <GlassNavItem key={item.path || index} {...item} />
      ))}
    </nav>
  );
};

const GlassNavItem = ({ 
  path,
  label,
  icon,
  badge,
  disabled = false,
  external = false,
  onClick,
  className = '',
  ...props 
}) => {
  const itemClasses = [
    'pro-nav-item',
    disabled && 'cursor-not-allowed opacity-50',
    className
  ].filter(Boolean).join(' ');

  const content = (
    <>
      {icon && (
        <span className="flex-shrink-0 w-5 h-5">
          {icon}
        </span>
      )}
      <span className="flex-1">
        {label}
      </span>
      {badge && (
        <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
          {badge}
        </span>
      )}
    </>
  );

  if (external) {
    return (
      <a
        href={path}
        target="_blank"
        rel="noopener noreferrer"
        className={itemClasses}
        onClick={disabled ? undefined : onClick}
        {...props}
      >
        {content}
      </a>
    );
  }

  if (path) {
    return (
      <NavLink
        to={path}
        className={({ isActive }) => 
          `${itemClasses} ${isActive ? 'active' : ''}`
        }
        onClick={disabled ? undefined : onClick}
        {...props}
      >
        {content}
      </NavLink>
    );
  }

  return (
    <button
      className={itemClasses}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...props}
    >
      {content}
    </button>
  );
};

export { GlassNavigation, GlassNavItem };
export default GlassNavigation;