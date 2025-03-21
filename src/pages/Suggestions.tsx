
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SuggestionForm from '@/components/suggestions/SuggestionForm';
import PreviousSuggestions from '@/components/suggestions/PreviousSuggestions';
import { useIsMobile } from '@/hooks/use-mobile';

const Suggestions = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-gloria-purple mb-4 md:mb-6">
          Buzón de Sugerencias
        </h1>

        {/* En móvil: disposición vertical. En escritorio: disposición en columnas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Formulario de sugerencia - Primero en móvil, a la izquierda en desktop */}
          <SuggestionForm />

          {/* Sugerencias anteriores - Segundo en móvil, a la derecha en desktop */}
          <PreviousSuggestions user={user} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Suggestions;
