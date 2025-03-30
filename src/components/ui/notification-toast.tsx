
import { toast } from '@/hooks/use-toast';
import { Bell, Clock, Trophy, CheckCircle, XCircle, Wifi, WifiOff, Award, AlertCircle } from 'lucide-react';

export const gameNotifications = {
  // Notificaciones de conexión
  connectSuccess: () => {
    toast({
      title: "¡Conexión recuperada!",
      description: "Te has reconectado con éxito a la partida.",
      icon: <Wifi className="text-green-500 h-5 w-5" />,
    });
  },
  
  connectionLost: () => {
    toast({
      title: "Conexión perdida",
      description: "Intentando reconectar...",
      variant: "destructive",
      icon: <WifiOff className="h-5 w-5" />,
    });
  },
  
  // Notificaciones de respuestas
  correctAnswer: (points: number) => {
    toast({
      title: "¡Respuesta correcta!",
      description: `Has ganado ${points} puntos.`,
      variant: "success",
      icon: <CheckCircle className="text-green-500 h-5 w-5" />,
    });
  },
  
  wrongAnswer: () => {
    toast({
      title: "Respuesta incorrecta",
      description: "Sigue intentándolo en la próxima pregunta.",
      variant: "destructive",
      icon: <XCircle className="h-5 w-5" />,
    });
  },
  
  // Notificaciones de estado del juego
  gameStarting: () => {
    toast({
      title: "¡La partida está por comenzar!",
      description: "Prepárate, quedan solo 5 segundos.",
      icon: <Bell className="text-gloria-gold h-5 w-5" />,
    });
  },
  
  fiveMinutesWarning: () => {
    toast({
      title: "5 minutos para el inicio",
      description: "La partida comenzará en 5 minutos.",
      icon: <Clock className="text-gloria-purple h-5 w-5" />,
    });
  },
  
  oneMinuteWarning: () => {
    toast({
      title: "1 minuto para el inicio",
      description: "La partida comenzará en 1 minuto.",
      icon: <Clock className="text-gloria-gold h-5 w-5" />,
    });
  },
  
  gameCompleted: (position: number) => {
    const messages = {
      1: "¡Increíble! Has ganado la partida.",
      2: "¡Excelente! Has quedado en segundo lugar.",
      3: "¡Buen trabajo! Has quedado en tercer lugar.",
      default: `Has finalizado en la posición ${position}.`
    };
    
    const description = position <= 3 
      ? messages[position as 1 | 2 | 3] 
      : messages.default;
    
    toast({
      title: "Partida finalizada",
      description,
      icon: <Trophy className="text-gloria-gold h-5 w-5" />,
    });
  },
  
  resultsSaved: () => {
    toast({
      title: "Resultados guardados",
      description: "Tus resultados han sido guardados correctamente.",
      icon: <Award className="text-gloria-purple h-5 w-5" />,
    });
  },
  
  // Notificaciones de flujo del juego
  newQuestion: () => {
    toast({
      title: "Nueva pregunta",
      description: "¡Responde rápido para ganar más puntos!",
      icon: <AlertCircle className="text-gloria-purple h-5 w-5" />,
    });
  },
  
  showingResults: () => {
    toast({
      title: "Resultados de la pregunta",
      description: "Veamos quién acertó...",
      icon: <CheckCircle className="text-gloria-purple h-5 w-5" />,
    });
  },
  
  showingLeaderboard: () => {
    toast({
      title: "Tabla de posiciones",
      description: "Veamos cómo va la clasificación...",
      icon: <Trophy className="text-gloria-purple h-5 w-5" />,
    });
  }
};
