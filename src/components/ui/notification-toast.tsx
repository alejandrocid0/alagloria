
import { toast } from "@/hooks/use-toast";

// Game notifications helper
export const gameNotifications = {
  // Success notifications
  connectSuccess: () => toast({
    title: "Conexión establecida",
    description: "Has conectado correctamente con la partida",
    variant: "default",
  }),
  
  // Error notifications
  connectionLost: () => toast({
    title: "Conexión perdida",
    description: "Intentando reconectar...",
    variant: "destructive",
  }),
  
  // Game state notifications
  correctAnswer: (points: number) => toast({
    title: "¡Respuesta correcta!",
    description: `Has sumado ${points} puntos`,
    variant: "default",
  }),
  
  wrongAnswer: () => toast({
    title: "Respuesta incorrecta",
    description: "No has sumado puntos en esta pregunta",
    variant: "destructive",
  }),
  
  gameStarting: () => toast({
    title: "¡La partida va a comenzar!",
    description: "Prepárate para la primera pregunta",
    variant: "default",
  }),
  
  gameCompleted: (rank: number) => toast({
    title: "Partida finalizada",
    description: `Has finalizado en posición ${rank}`,
    variant: "default",
  }),
  
  joinedGame: (gameTitle: string) => toast({
    title: "¡Te has unido a la partida!",
    description: `Esperando a que comience: ${gameTitle}`,
    variant: "default",
  }),
  
  // Add the missing notifications
  fiveMinutesWarning: () => toast({
    title: "5 minutos para el inicio",
    description: "La partida comenzará en breve",
    variant: "default",
  }),
  
  resultsSaved: () => toast({
    title: "Resultados guardados",
    description: "Tus resultados han sido guardados correctamente",
    variant: "default",
  })
};
