
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Users, Calendar, Clock, ArrowRightCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { gameNotifications } from '@/components/ui/notification-toast';
import WaitingRoom from './WaitingRoom';

interface WaitingModeDisplayProps {
  gameId: string | undefined;
  gameTitle: string;
  scheduledTime: string;
  playersOnline: any[];
  timeUntilStart: number;
  isGameActive: boolean;
  onRefresh?: () => void;
}

const WaitingModeDisplay = ({
  gameId,
  gameTitle,
  scheduledTime,
  playersOnline,
  timeUntilStart,
  isGameActive,
  onRefresh
}: WaitingModeDisplayProps) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState<number>(timeUntilStart);
  const [isImminentStart, setIsImminentStart] = useState<boolean>(false);
  const [hasNotifiedFiveMin, setHasNotifiedFiveMin] = useState<boolean>(false);
  const [hasNotifiedOneMin, setHasNotifiedOneMin] = useState<boolean>(false);
  
  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Cuenta regresiva actualizada
  useEffect(() => {
    // Inicializar con el valor proporcionado
    setCountdown(timeUntilStart);
    
    // Crear un intervalo que actualice la cuenta regresiva cada segundo
    const intervalId = setInterval(() => {
      setCountdown(prev => {
        const newValue = prev - 1;
        
        // Si llegamos a cero o menos, limpiar el intervalo
        if (newValue <= 0) {
          clearInterval(intervalId);
          return 0;
        }
        
        // Verificar si estamos en un punto donde debemos notificar
        if (newValue === 300 && !hasNotifiedFiveMin) { // 5 minutos
          setHasNotifiedFiveMin(true);
          gameNotifications.fiveMinutesWarning();
        }
        
        if (newValue === 60 && !hasNotifiedOneMin) { // 1 minuto
          setHasNotifiedOneMin(true);
          gameNotifications.oneMinuteWarning();
        }
        
        // Verificar si la partida está por comenzar (menos de 10 segundos)
        if (newValue <= 10) {
          setIsImminentStart(true);
          if (newValue === 5) {
            gameNotifications.gameStarting();
          }
        }
        
        return newValue;
      });
    }, 1000);
    
    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, [timeUntilStart, hasNotifiedFiveMin, hasNotifiedOneMin]);
  
  // Controlar la redirección cuando el juego cambia a activo
  useEffect(() => {
    if (isGameActive) {
      toast({
        title: "¡La partida ha comenzado!",
        description: "Redirigiendo a la partida en vivo...",
      });
      
      // Redireccionar después de un breve retraso
      setTimeout(() => {
        if (gameId) {
          navigate(`/game/${gameId}`);
        }
      }, 1000);
    }
  }, [isGameActive, gameId, navigate]);
  
  // Formatear el tiempo restante en formato legible
  const formatTimeRemaining = (seconds: number) => {
    if (seconds <= 0) return "¡Ahora!";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-md overflow-hidden"
    >
      {/* Cabecera con título e información */}
      <div className="bg-gloria-purple text-white p-6 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="z-10 relative"
        >
          <h1 className="text-2xl font-serif font-bold mb-2">{gameTitle}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center text-sm space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{formatDate(scheduledTime)}</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              <span>{playersOnline.length} {playersOnline.length === 1 ? 'participante' : 'participantes'}</span>
            </div>
          </div>
        </motion.div>
        
        {/* Decoración de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute right-0 bottom-0 transform translate-x-1/4 translate-y-1/4">
            <Clock className="w-64 h-64" />
          </div>
        </div>
      </div>
      
      {/* Contador regresivo destacado */}
      <div className="p-6 border-b border-gray-200">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-700 mb-1">
            {countdown > 0 ? 'Tiempo hasta el inicio' : 'La partida está iniciando...'}
          </h2>
          
          <motion.div 
            className={`text-4xl font-bold mt-3 ${isImminentStart ? 'text-gloria-gold' : 'text-gloria-purple'}`}
            animate={{ 
              scale: isImminentStart && countdown > 0 ? [1, 1.1, 1] : 1,
            }}
            transition={{ 
              duration: 1, 
              repeat: isImminentStart && countdown > 0 ? Infinity : 0,
              repeatDelay: 0.5
            }}
          >
            {formatTimeRemaining(countdown)}
          </motion.div>
          
          {isImminentStart && countdown > 0 && (
            <p className="text-sm text-gloria-gold mt-2 font-medium animate-pulse">
              Prepárate, la partida comenzará muy pronto...
            </p>
          )}
          
          {countdown <= 0 && !isGameActive && (
            <div className="mt-4">
              <p className="text-sm text-gloria-purple mb-2">
                El juego debería iniciar automáticamente. Si no ocurre, puedes:
              </p>
              <div className="flex justify-center space-x-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onRefresh} 
                  className="flex items-center"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Recargar
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => gameId && navigate(`/game/${gameId}`)}
                  className="flex items-center"
                >
                  <ArrowRightCircle className="w-4 h-4 mr-1" />
                  Ir a la partida
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Sala de espera con lista de jugadores */}
      <WaitingRoom players={playersOnline} />
    </motion.div>
  );
};

export default WaitingModeDisplay;
