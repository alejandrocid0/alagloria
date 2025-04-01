
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

const CreateGame = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const isAdmin = profile?.is_admin || false;
  
  React.useEffect(() => {
    // Redirect if not admin
    if (!user) {
      navigate('/login', { state: { redirectTo: '/admin/create' } });
    } else if (!isAdmin) {
      navigate('/dashboard');
    }
  }, [user, isAdmin, navigate]);

  return (
    <>
      <Navbar />
      <div className="pt-24 pb-16 min-h-screen">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-2xl font-serif font-bold mb-6">Crear Partida</h1>
          <p className="text-gray-500">Esta página está en desarrollo.</p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CreateGame;
