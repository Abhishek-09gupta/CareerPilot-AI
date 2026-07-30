import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#0b0f19',
        color: '#f3f4f6',
        fontFamily: 'sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
        }}>
          <h2>Loading CareerPilot...</h2>
          <p style={{ color: '#9ca3af', marginTop: '10px' }}>Connecting to secure session</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
