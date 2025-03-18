
import React from 'react';
import { AuthContext } from './AuthContext';
import { useAuthState } from './hooks/useAuthState';
import { useAuthMethods } from './hooks/useAuthMethods';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authState = useAuthState();
  const authMethods = useAuthMethods(authState);

  // Combinamos el estado y los métodos para el contexto
  const authContextValue = {
    currentUser: authState.currentUser,
    isAuthenticated: authState.isAuthenticated,
    isAdmin: authState.isAdmin,
    session: authState.session,
    loading: authState.loading,
    ...authMethods
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
