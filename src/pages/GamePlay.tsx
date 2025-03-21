
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import LiveGameRenderer from '@/components/gameplay/LiveGameRenderer';

const GamePlay = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Redirigir a login si no hay usuario autenticado
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [user, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="pt-20 md:pt-24 pb-16 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-gloria-purple/20 border-t-gloria-purple rounded-full"></div>
        </div>
      </div>
    );
  }
  
  // Solo renderizar si hay un usuario autenticado
  if (!user) return null;
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="pt-20 md:pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <LiveGameRenderer />
        </div>
      </div>
    </div>
  );
};

export default GamePlay;
