
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Signup from './Signup';
import { useAuth } from '@/contexts/AuthContext';

// Re-export Signup as Register to maintain backward compatibility
const Register = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to games if already authenticated
  useEffect(() => {
    if (session) {
      navigate('/games');
    }
  }, [session, navigate]);
  
  return <Signup />;
};

export default Register;
