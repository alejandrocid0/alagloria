
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

const GameResults = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  React.useEffect(() => {
    // Redirect to login if no user
    if (!user) {
      navigate('/login', { state: { redirectTo: `/results/${gameId}` } });
    }
  }, [user, navigate, gameId]);

  return (
    <>
      <Navbar />
      <div className="pt-24 pb-16 min-h-screen">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-2xl font-serif font-bold mb-6">Resultados de la Partida</h1>
          <p className="text-gray-700">ID de Partida: {gameId}</p>
          <p className="text-gray-500 mt-4">Esta página está en desarrollo.</p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default GameResults;
