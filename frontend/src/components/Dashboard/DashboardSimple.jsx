import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const DashboardSimple = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Dashboard Test</h1>
      <p>Welcome, {user.username}!</p>
      <div>
        <h3>User Data:</h3>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </div>
    </div>
  );
};

export default DashboardSimple;