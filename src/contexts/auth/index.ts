
import { useContext } from 'react';
import { AuthContext, AuthContextType } from './AuthContext';

export { AuthProvider } from './AuthProvider';
export type { UserProfile, GameResult, UserStats } from './types';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
