
import { toast } from '@/hooks/use-toast';

export const gameNotifications = {
  /**
   * Notificación cuando el juego está comenzando
   */
  gameStarting: () => {
    toast({
      title: "¡La partida está comenzando!",
      description: "Redirigiendo a la partida...",
      variant: "default"
    });
  },
  
  /**
   * Notificación cuando hay una nueva pregunta
   */
  newQuestion: () => {
    toast({
      title: "Nueva pregunta",
      description: "Se ha presentado una nueva pregunta",
      variant: "default"
    });
  },
  
  /**
   * Notificación cuando se muestran los resultados
   */
  showingResults: () => {
    toast({
      title: "Resultados",
      description: "Comprobando respuestas...",
      variant: "default"
    });
  },
  
  /**
   * Notificación cuando se muestra el leaderboard
   */
  showingLeaderboard: () => {
    toast({
      title: "Clasificación",
      description: "Actualizando posiciones...",
      variant: "default"
    });
  },
  
  /**
   * Notificación cuando el juego se completa
   */
  gameCompleted: (rank: number) => {
    toast({
      title: "¡Juego completado!",
      description: rank <= 3 
        ? `¡Felicidades! Has terminado en posición ${rank}` 
        : `Has terminado en posición ${rank}`,
      variant: "default"
    });
  },
  
  /**
   * Notificación para respuesta correcta
   */
  correctAnswer: (points: number) => {
    toast({
      title: "¡Respuesta correcta!",
      description: `Has ganado ${points} puntos`,
      variant: "default"
    });
  },
  
  /**
   * Notificación para respuesta incorrecta
   */
  wrongAnswer: () => {
    toast({
      title: "Respuesta incorrecta",
      description: "Más suerte la próxima vez",
      variant: "destructive"
    });
  },
  
  /**
   * Notificación cuando se ha conectado con éxito
   */
  connectSuccess: () => {
    toast({
      title: "Conectado",
      description: "Te has vuelto a conectar a la partida",
      variant: "default"
    });
  },
  
  /**
   * Notificación cuando se pierde la conexión
   */
  connectionLost: () => {
    toast({
      title: "Conexión perdida",
      description: "Intentando reconectar...",
      variant: "destructive"
    });
  },
  
  /**
   * Notificación cuando los resultados se han guardado
   */
  resultsSaved: () => {
    toast({
      title: "Resultados guardados",
      description: "Tus resultados se han guardado correctamente",
      variant: "default"
    });
  },
  
  /**
   * Notificación 5 minutos antes del inicio
   */
  fiveMinutesWarning: () => {
    toast({
      title: "5 minutos para empezar",
      description: "La partida comenzará en 5 minutos",
      variant: "default"
    });
  },
  
  /**
   * Notificación 1 minuto antes del inicio
   */
  oneMinuteWarning: () => {
    toast({
      title: "1 minuto para empezar",
      description: "La partida comenzará en 1 minuto",
      variant: "default"
    });
  }
};
