
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GameHistoryCard from '@/components/dashboard/GameHistoryCard';
import SpendingCard from '@/components/dashboard/SpendingCard';
import SuccessRatioCard from '@/components/dashboard/SuccessRatioCard';
import StatsOverviewCard from '@/components/dashboard/StatsOverviewCard';

const Dashboard = () => {
  const { currentUser, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { state: { redirectTo: '/dashboard' } });
    }
  }, [isAuthenticated, navigate, loading]);

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse bg-gloria-purple/20 h-8 w-64 rounded-md mb-4 mx-auto"></div>
            <div className="animate-pulse bg-gloria-purple/10 h-4 w-48 rounded-md mx-auto"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-20">
        <h1 className="text-3xl font-serif font-bold text-gloria-purple mb-8">
          Dashboard de {currentUser.name}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsOverviewCard 
            user={currentUser} 
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GameHistoryCard 
            gameHistory={currentUser.stats.gamesPlayed} 
          />
          
          <div className="space-y-8">
            <SpendingCard 
              totalSpent={currentUser.stats.totalSpent}
              gameHistory={currentUser.stats.gamesPlayed}
            />
            
            <SuccessRatioCard 
              correctAnswers={currentUser.stats.correctAnswers}
              totalAnswers={currentUser.stats.totalAnswers}
              gameHistory={currentUser.stats.gamesPlayed}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
