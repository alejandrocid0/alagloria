
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SuggestionForm from '@/components/suggestions/SuggestionForm';
import PreviousSuggestions from '@/components/suggestions/PreviousSuggestions';

const Suggestions = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { state: { redirectTo: '/suggestions' } });
    }
  }, [user, loading, navigate]);

  // Estado de carga
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-gloria-purple border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gloria-purple">Cargando...</p>
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
        <h1 className="text-3xl font-serif font-bold text-gloria-purple mb-6">
          Buzón de Sugerencias
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Formulario de sugerencia */}
          <SuggestionForm />

          {/* Sugerencias anteriores */}
          <PreviousSuggestions user={user} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Suggestions;
