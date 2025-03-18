
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GameManagement from '@/components/admin/GameManagement';
import GamesList from '@/components/admin/GamesList';

const AdminDashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const isAdmin = profile?.is_admin || false;

  useEffect(() => {
    // Redireccionar si no está autenticado o no es admin
    if (!loading) {
      if (!user) {
        navigate('/login', { state: { redirectTo: '/admin' } });
      } else if (!isAdmin) {
        navigate('/dashboard');
      }
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-gloria-purple border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gloria-purple">Verificando permisos...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null; // La redirección se maneja en el efecto
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-20">
        <h1 className="text-3xl font-serif font-bold text-gloria-purple mb-6">
          Panel de Administración
        </h1>
        
        <Tabs defaultValue="games-list" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="games-list">Lista de Partidas</TabsTrigger>
            <TabsTrigger value="create-game">Crear Partida</TabsTrigger>
            <TabsTrigger value="statistics">Estadísticas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="games-list">
            <GamesList />
          </TabsContent>
          
          <TabsContent value="create-game">
            <GameManagement />
          </TabsContent>
          
          <TabsContent value="statistics">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Estadísticas de Partidas</h2>
              <p className="text-gray-500">Esta función estará disponible próximamente.</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
