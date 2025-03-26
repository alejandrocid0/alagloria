
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Wifi, WifiOff, TimerIcon, Award, Save } from "lucide-react";

// Game notifications helper
export const gameNotifications = {
  // Success notifications
  connectSuccess: () => toast({
    title: "Conexión establecida",
    description: "Has conectado correctamente con la partida",
    variant: "default",
    action: (
      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
        <Wifi className="w-3 h-3 text-green-600" />
      </div>
    )
  }),
  
  // Error notifications
  connectionLost: () => toast({
    title: "Conexión perdida",
    description: "Intentando reconectar...",
    variant: "destructive",
    action: (
      <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
        <WifiOff className="w-3 h-3 text-red-600" />
      </div>
    )
  }),
  
  // Game state notifications
  correctAnswer: (points: number) => toast({
    title: "¡Respuesta correcta!",
    description: `Has sumado ${points} puntos`,
    variant: "default",
    action: (
      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-3 h-3 text-green-600" />
      </div>
    )
  }),
  
  wrongAnswer: () => toast({
    title: "Respuesta incorrecta",
    description: "No has sumado puntos en esta pregunta",
    variant: "destructive",
    action: (
      <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
        <XCircle className="w-3 h-3 text-red-600" />
      </div>
    )
  }),
  
  gameStarting: () => toast({
    title: "¡La partida va a comenzar!",
    description: "Prepárate para la primera pregunta",
    variant: "default",
    action: (
      <div className="w-5 h-5 bg-gloria-purple/20 rounded-full flex items-center justify-center">
        <TimerIcon className="w-3 h-3 text-gloria-purple" />
      </div>
    )
  }),
  
  gameCompleted: (rank: number) => toast({
    title: "Partida finalizada",
    description: `Has finalizado en posición ${rank}`,
    variant: "default",
    action: (
      <div className="w-5 h-5 bg-gloria-gold/20 rounded-full flex items-center justify-center">
        <Award className="w-3 h-3 text-gloria-gold" />
      </div>
    )
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
    action: (
      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
        <TimerIcon className="w-3 h-3 text-blue-600" />
      </div>
    )
  }),
  
  resultsSaved: () => toast({
    title: "Resultados guardados",
    description: "Tus resultados han sido guardados correctamente",
    variant: "default",
    action: (
      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
        <Save className="w-3 h-3 text-green-600" />
      </div>
    )
  })
};
