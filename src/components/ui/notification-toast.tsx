
import { toast } from '@/hooks/use-toast';
import { Bell, Clock, Trophy, CheckCircle, XCircle, Wifi, WifiOff, Award, AlertCircle, Save } from 'lucide-react';
import { ReactNode } from 'react';

// Define a custom toast type that includes the icon property
type CustomToastProps = {
  title: string;
  description: string;
  variant?: "default" | "destructive";
  icon?: ReactNode;
  duration?: number;
}

// Helper function to show toast with icon
const showToast = ({ title, description, variant = "default", icon, duration = 5000 }: CustomToastProps) => {
  return toast({
    title,
    description,
    variant,
    duration,
    // Only add these properties if they have values
    ...(icon && { 
      className: "flex items-start",
      description: (
        <div className="flex items-start gap-2">
          <span className="mt-1 flex-shrink-0">{icon}</span>
          <div>{description}</div>
        </div>
      )
    })
  });
};

export const gameNotifications = {
  // Notificaciones de conexión
  connectSuccess: () => {
    showToast({
      title: "¡Conexión recuperada!",
      description: "Te has reconectado con éxito a la partida.",
      icon: <Wifi className="text-green-500 h-5 w-5" />,
    });
  },
  
  connectionLost: () => {
    showToast({
      title: "Conexión perdida",
      description: "Intentando reconectar...",
      variant: "destructive",
      icon: <WifiOff className="h-5 w-5" />,
      duration: 10000, // Show longer for connection issues
    });
  },
  
  // Notificaciones de respuestas
  correctAnswer: (points: number) => {
    showToast({
      title: "¡Respuesta correcta!",
      description: `Has ganado ${points} puntos.`,
      icon: <CheckCircle className="text-green-500 h-5 w-5" />,
    });
  },
  
  wrongAnswer: () => {
    showToast({
      title: "Respuesta incorrecta",
      description: "Sigue intentándolo en la próxima pregunta.",
      variant: "destructive",
      icon: <XCircle className="h-5 w-5" />,
    });
  },
  
  // Notificaciones de estado del juego
  gameStarting: () => {
    showToast({
      title: "¡La partida está comenzando!",
      description: "Prepárate para responder preguntas.",
      icon: <Bell className="text-gloria-gold h-5 w-5" />,
    });
  },
  
  fiveMinutesWarning: () => {
    showToast({
      title: "5 minutos para el inicio",
      description: "La partida comenzará en 5 minutos.",
      icon: <Clock className="text-gloria-purple h-5 w-5" />,
    });
  },
  
  oneMinuteWarning: () => {
    showToast({
      title: "1 minuto para el inicio",
      description: "La partida comenzará en 1 minuto. ¡Prepárate!",
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
    
    showToast({
      title: "Partida finalizada",
      description,
      icon: <Trophy className="text-gloria-gold h-5 w-5" />,
      duration: 7000, // Show longer for game completion
    });
  },
  
  resultsSaved: () => {
    showToast({
      title: "Resultados guardados",
      description: "Tus resultados han sido guardados correctamente.",
      icon: <Save className="text-gloria-purple h-5 w-5" />,
    });
  },
  
  // Notificaciones de flujo del juego
  newQuestion: () => {
    showToast({
      title: "Nueva pregunta",
      description: "¡Responde rápido para ganar más puntos!",
      icon: <AlertCircle className="text-gloria-purple h-5 w-5" />,
    });
  },
  
  showingResults: () => {
    showToast({
      title: "Resultados de la pregunta",
      description: "Veamos quién acertó...",
      icon: <CheckCircle className="text-gloria-purple h-5 w-5" />,
    });
  },
  
  showingLeaderboard: () => {
    showToast({
      title: "Tabla de posiciones",
      description: "Veamos cómo va la clasificación...",
      icon: <Trophy className="text-gloria-purple h-5 w-5" />,
    });
  },
  
  autoRedirectNotification: (seconds: number) => {
    showToast({
      title: "Redirección automática",
      description: `Serás redirigido a la página de resultados en ${seconds} segundos...`,
      icon: <Clock className="text-blue-500 h-5 w-5" />,
    });
  }
};
