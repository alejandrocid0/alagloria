
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GameHistoryCard from '@/components/dashboard/GameHistoryCard';
import SpendingCard from '@/components/dashboard/SpendingCard';
import SuccessRatioCard from '@/components/dashboard/SuccessRatioCard';
import StatsOverviewCard from '@/components/dashboard/StatsOverviewCard';

const Dashboard = () => {
  const { currentUser, isAuthenticated, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        console.log("No autenticado, redirigiendo a login");
        setIsRedirecting(true);
        navigate('/login', { 
          state: { redirectTo: '/dashboard' },
          replace: true 
        });
        return;
      }
      
      if (isAdmin) {
        console.log("Usuario es admin, redirigiendo a panel de administración");
        setIsRedirecting(true);
        navigate('/admin', { replace: true });
        return;
      }
    }
  }, [isAuthenticated, isAdmin, navigate, loading]);

  if (loading || isRedirecting || !isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-gloria-purple border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gloria-purple">
              {loading ? "Cargando datos..." : "Redirigiendo..."}
            </p>
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
