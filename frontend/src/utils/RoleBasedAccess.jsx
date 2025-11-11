import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export const RoleBasedComponent = ({ allowedRoles, children, fallback = null }) => {
  const { user } = useAuth();
  
  if (!user || !user.role) {
    return fallback;
  }
  
  const userRole = user.role.toUpperCase();
  const allowed = allowedRoles.map(role => role.toUpperCase());
  
  return allowed.includes(userRole) ? children : fallback;
};

export const AdminOnly = ({ children, fallback = null }) => {
  return (
    <RoleBasedComponent allowedRoles={['ADMIN']} fallback={fallback}>
      {children}
    </RoleBasedComponent>
  );
};

export const UserOnly = ({ children, fallback = null }) => {
  return (
    <RoleBasedComponent allowedRoles={['USER']} fallback={fallback}>
      {children}
    </RoleBasedComponent>
  );
};

export const useRoles = () => {
  const { user } = useAuth();
  
  const isAdmin = () => user?.role?.toUpperCase() === 'ADMIN';
  const isUser = () => user?.role?.toUpperCase() === 'USER';
  const hasRole = (role) => user?.role?.toUpperCase() === role.toUpperCase();
  
  return {
    isAdmin,
    isUser,
    hasRole,
    userRole: user?.role
  };
};