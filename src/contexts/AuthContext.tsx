
import React, { createContext, useContext, useState, useEffect } from 'react';

interface GameResult {
  id: string;
  gameId: string;
  gameTitle: string;
  date: Date;
  position: number;
  entryFee: number;
  correctAnswers: number;
  totalAnswers: number;
}

interface UserStats {
  gamesPlayed: GameResult[];
  totalSpent: number;
  correctAnswers: number;
  totalAnswers: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  stats: UserStats;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  logout: () => void;
  getUserProfile: () => User | null;
  updateUserStats: (gameResult: GameResult) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check if user is already logged in when the app loads
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        // Convert date strings back to Date objects for game results
        if (parsedUser.stats && parsedUser.stats.gamesPlayed) {
          parsedUser.stats.gamesPlayed = parsedUser.stats.gamesPlayed.map((game: any) => ({
            ...game,
            date: new Date(game.date)
          }));
        }
        
        setCurrentUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const updateUserStats = (gameResult: GameResult) => {
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      stats: {
        gamesPlayed: [...currentUser.stats.gamesPlayed, gameResult],
        totalSpent: currentUser.stats.totalSpent + gameResult.entryFee,
        correctAnswers: currentUser.stats.correctAnswers + gameResult.correctAnswers,
        totalAnswers: currentUser.stats.totalAnswers + gameResult.totalAnswers
      }
    };

    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setIsAuthenticated(false);
    window.location.href = '/';
  };

  const getUserProfile = (): User | null => {
    return currentUser;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        logout,
        getUserProfile,
        updateUserStats,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
