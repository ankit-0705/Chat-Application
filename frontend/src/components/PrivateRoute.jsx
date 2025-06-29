import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import ChatContext from '../context/chatContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(ChatContext);

  if (loading) {
    return <div className="text-white p-4">Checking authentication...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
