
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Componente placeholder para el dashboard
const Dashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redireccionar si no está autenticado
    if (!loading && !user) {
      navigate('/login', { state: { redirectTo: '/dashboard' } });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-gloria-purple border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gloria-purple">Cargando tu perfil...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!user || !profile) {
    return null; // La redirección se maneja en el efecto
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16 bg-gloria-cream bg-opacity-30">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-serif font-bold text-gloria-purple mb-8">
            Perfil de {profile.name}
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Información del usuario */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4 text-gloria-purple">Información Personal</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Nombre</p>
                  <p className="font-medium">{profile.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Correo electrónico</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Miembro desde</p>
                  <p className="font-medium">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Historial de juegos */}
            <div className="bg-white p-6 rounded-lg shadow-md col-span-2">
              <h2 className="text-xl font-bold mb-4 text-gloria-purple">Historial de Partidas</h2>
              <div className="text-center py-8 text-gray-500">
                <p>Aún no has participado en ninguna partida.</p>
                <p className="mt-2">
                  ¡Participa en los juegos y demuestra tus conocimientos!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;
