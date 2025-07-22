import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

const AuthCheck = () => {
  const { currentUser, error, loading } = useSelector((state) => state.user);

  useEffect(() => {
    console.log('AuthCheck - Current User:', currentUser);
    console.log('AuthCheck - Error:', error);
    console.log('AuthCheck - Loading:', loading);
  }, [currentUser, error, loading]);

  return null; // This component doesn't render anything
};

export default AuthCheck; 