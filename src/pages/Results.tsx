
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

const Results = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  React.useEffect(() => {
    // Redirect to login if no user
    if (!user) {
      navigate('/login', { state: { redirectTo: '/results' } });
    }
  }, [user, navigate]);

  return (
    <>
      <Navbar />
      <div className="pt-24 pb-16 min-h-screen">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-2xl font-serif font-bold mb-6">Resultados</h1>
          <p className="text-gray-500">Esta página está en desarrollo.</p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Results;
