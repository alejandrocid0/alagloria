
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Dashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    // Redireccionar si no está autenticado
    if (!loading && !user) {
      navigate('/login', { state: { redirectTo: '/dashboard' } });
    } else if (!loading) {
      // Si ya no está cargando, actualizamos el estado local
      setLocalLoading(false);
    }
  }, [user, loading, navigate]);

  // Establecemos un tiempo máximo de espera para mostrar la página del dashboard
  useEffect(() => {
    // Si después de 2 segundos aún está cargando, mostramos el dashboard de todos modos
    const timer = setTimeout(() => {
      setLocalLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (localLoading && loading) {
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

  // Incluso si no tenemos todos los datos del perfil, mostramos la página con la información disponible
  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16 bg-gloria-cream bg-opacity-30">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-serif font-bold text-gloria-purple mb-8">
            {profile?.name ? `Perfil de ${profile.name}` : 'Tu Perfil'}
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Información del usuario */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4 text-gloria-purple">Información Personal</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Nombre</p>
                  <p className="font-medium">{profile?.name || user?.email?.split('@')[0] || 'Usuario'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Correo electrónico</p>
                  <p className="font-medium">{user?.email || profile?.email || 'No disponible'}</p>
                </div>
                {profile?.created_at && (
                  <div>
                    <p className="text-sm text-gray-500">Miembro desde</p>
                    <p className="font-medium">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
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
