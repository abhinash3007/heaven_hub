import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

const AuthCheck = () => {
  const { currentUser, error, loading } = useSelector((state) => state.user);

  useEffect(() => {

  }, [currentUser, error, loading]);

  return null; 
};

export default AuthCheck; 