import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, Award, AlertCircle, CreditCard, Check } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { gameService } from '@/services/gameService';
import { fetchGamesFromSupabase } from '@/components/games/gamesUtils';
import { Game } from '@/components/games/types';
import { supabase } from '@/integrations/supabase/client';

const JoinGame = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [gameData, setGameData] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Inicia sesión para unirte",
        description: "Necesitas iniciar sesión para participar en las partidas",
        variant: "destructive"
      });
      navigate("/login", { state: { redirectTo: `/join/${gameId}` } });
      return;
    }
    
    const fetchGameData = async () => {
      try {
        setLoading(true);
        const games = await fetchGamesFromSupabase();
        const game = games.find(g => g.id === gameId);
        
        if (!game) {
          toast({
            title: "Partida no encontrada",
            description: "No se pudo encontrar la partida especificada",
            variant: "destructive"
          });
          navigate("/games");
          return;
        }
        
        setGameData(game);
        
        // Verificar si el usuario ya está inscrito
        if (user && gameId) {
          const { data } = await supabase
            .from('game_participants')
            .select()
            .eq('game_id', gameId)
            .eq('user_id', user.id);
          
          if (data && data.length > 0) {
            setPaymentComplete(true);
          }
        }
      } catch (error) {
        console.error("Error fetching game:", error);
        toast({
          title: "Error al cargar la partida",
          description: "No se pudo cargar la información de la partida",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchGameData();
    
    // Configurar suscripción en tiempo real para actualizaciones
    if (gameId) {
      const channel = supabase
        .channel(`game-${gameId}`)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'game_participants',
            filter: `game_id=eq.${gameId}`
          }, 
          () => {
            fetchGameData();
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [gameId, isAuthenticated, navigate, user]);
  
  const handleJoinGame = async () => {
    if (!user || !gameId || !gameData) return;
    
    setIsProcessing(true);
    
    try {
      await gameService.joinGame(gameId, user.id);
      
      toast({
        title: "¡Pago completado!",
        description: "Te has unido a la partida correctamente",
      });
      
      setPaymentComplete(true);
    } catch (error) {
      console.error("Error joining game:", error);
      toast({
        title: "Error al unirse",
        description: "No se pudo completar la inscripción. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (loading || !gameData) {
    return (
      <>
        <Navbar />
        <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gloria-purple"></div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  const formattedDate = gameData.date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return (
    <>
      <Navbar />
      
      <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {!paymentComplete ? (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="h-48 overflow-hidden relative">
                      <img 
                        src={gameData.image} 
                        alt={gameData.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gloria-deepPurple/70 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">
                          {gameData.title}
                        </h1>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-gloria-purple mr-2" />
                          <span className="text-gray-700">{formattedDate}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Users className="h-5 w-5 text-gloria-purple mr-2" />
                          <span className="text-gray-700">{gameData.participants} de {gameData.maxParticipants} participantes</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Award className="h-5 w-5 text-gloria-gold mr-2" />
                          <span className="font-medium text-gloria-gold">{gameData.prizePool}€ en premios</span>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gloria-purple mb-2">
                          Descripción
                        </h2>
                        <p className="text-gray-600">
                          {gameData.description || "Sin descripción disponible."}
                        </p>
                      </div>
                      
                      <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gloria-purple mb-3">
                          Premios
                        </h2>
                        <div className="bg-gloria-cream/20 rounded-lg p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {gameData.prizeDistribution.map((prize) => (
                              <div 
                                key={prize.position} 
                                className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm text-center"
                              >
                                <div className="text-lg font-semibold text-gloria-purple mb-1">
                                  {prize.position === 1 ? "🥇 Primer puesto" : 
                                   prize.position === 2 ? "🥈 Segundo puesto" : 
                                   "🥉 Tercer puesto"}
                                </div>
                                <div className="text-sm text-gray-500 mb-2">
                                  {prize.percentage}% del bote
                                </div>
                                <div className="text-xl font-bold text-gloria-gold">
                                  {prize.amount}€
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h2 className="text-lg font-semibold text-gloria-purple mb-3">
                          ¿Cómo funciona?
                        </h2>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600">Une a la partida por solo 1€ para poder participar.</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600">Conéctate a la hora programada para jugar en directo con todos los participantes.</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600">Responde correctamente y lo más rápido posible para acumular puntos.</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600">Los tres primeros puestos reciben premios económicos del bote acumulado.</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                    <h2 className="text-xl font-serif font-bold text-gloria-purple mb-6">
                      Unirse a la partida
                    </h2>
                    
                    <div className="mb-8">
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600">Precio de inscripción</span>
                        <span className="font-semibold">1.00€</span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-gray-600">Total a pagar</span>
                        <span className="text-xl font-bold text-gloria-purple">1.00€</span>
                      </div>
                    </div>
                    
                    <div className="mb-8">
                      <div className="bg-gloria-cream/20 rounded-lg p-4 flex items-start">
                        <Clock className="h-5 w-5 text-gloria-purple mr-3 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-gloria-purple mb-1">Fecha de la partida</h3>
                          <p className="text-sm text-gray-600">{formattedDate}</p>
                          <p className="text-xs text-gray-500 mt-1">Recuerda conectarte 5 minutos antes del inicio.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <div className="bg-yellow-50 rounded-lg p-4 flex items-start">
                        <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-yellow-800 mb-1">Información importante</h3>
                          <p className="text-sm text-yellow-700">
                            Una vez realizado el pago, no se podrá solicitar un reembolso. 
                            Al participar, aceptas los términos y condiciones del juego.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {hasUserJoined() ? (
                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full"
                        href={`/game/${gameId}`}
                      >
                        Ya estás inscrito - Ir a la sala
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="lg"
                        className="w-full flex items-center justify-center"
                        isLoading={isProcessing}
                        onClick={handleJoinGame}
                        disabled={gameData.participants >= gameData.maxParticipants}
                      >
                        {!isProcessing && (
                          <CreditCard className="mr-2 h-5 w-5" />
                        )}
                        {gameData.participants >= gameData.maxParticipants 
                          ? "Partida completa" 
                          : "Pagar 1€ y unirse"}
                      </Button>
                    )}
                    
                    <div className="mt-4 text-center">
                      <Link to="/games" className="text-sm text-gloria-purple hover:text-gloria-gold transition-colors">
                        Cancelar y volver a partidas
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="h-8 w-8 text-green-500" />
                  </div>
                  
                  <h2 className="text-2xl font-serif font-bold text-gloria-purple mb-4">
                    ¡Te has unido a la partida!
                  </h2>
                  
                  <p className="text-gray-600 mb-8">
                    Has completado tu inscripción a <span className="font-semibold">{gameData.title}</span>. 
                    Recuerda conectarte el <span className="font-semibold">{formattedDate}</span> para participar.
                  </p>
                  
                  <div className="bg-gloria-cream/20 rounded-lg p-6 mb-8">
                    <h3 className="font-semibold text-gloria-purple mb-4">Detalles de la partida</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <Calendar className="h-6 w-6 text-gloria-purple mx-auto mb-2" />
                        <div className="text-sm text-gray-500">Fecha</div>
                        <div className="font-medium">{gameData.date.toLocaleDateString('es-ES')}</div>
                      </div>
                      
                      <div className="text-center">
                        <Clock className="h-6 w-6 text-gloria-purple mx-auto mb-2" />
                        <div className="text-sm text-gray-500">Hora</div>
                        <div className="font-medium">{gameData.date.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}</div>
                      </div>
                      
                      <div className="text-center">
                        <Award className="h-6 w-6 text-gloria-gold mx-auto mb-2" />
                        <div className="text-sm text-gray-500">Premio total</div>
                        <div className="font-medium text-gloria-gold">{gameData.prizePool}€</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full"
                      href={`/game/${gameId}`}
                    >
                      Ir a la sala de espera
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full"
                      href="/games"
                    >
                      Ver más partidas
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default JoinGame;
