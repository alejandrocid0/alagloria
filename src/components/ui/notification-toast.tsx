
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle, XCircle, Info, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationProps {
  title: string;
  message: string;
  type?: NotificationType;
  duration?: number;
}

/**
 * Muestra una notificación personalizada con animación
 */
export const showNotification = ({
  title,
  message,
  type = 'info',
  duration = 5000,
}: NotificationProps) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
  };

  const colors = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  };

  const iconColors = {
    success: "text-green-500",
    error: "text-red-500",
    info: "text-blue-500",
    warning: "text-yellow-500",
  };

  return toast({
    title: title,
    description: (
      <div className="flex items-start">
        <span className={cn("mr-2", iconColors[type])}>
          {icons[type]}
        </span>
        <span>{message}</span>
      </div>
    ),
    className: cn(
      "rounded-lg border p-4",
      colors[type]
    ),
    duration: duration,
  });
};

/**
 * Componentes para mostrar notificaciones en momentos clave
 */
export const gameNotifications = {
  connectSuccess: () => 
    showNotification({
      title: "¡Conectado!",
      message: "Conexión a la partida establecida con éxito",
      type: "success"
    }),
  
  connectionLost: () => 
    showNotification({
      title: "Conexión perdida",
      message: "Intentando reconectar automáticamente...",
      type: "warning",
      duration: 8000
    }),
  
  reconnected: () => 
    showNotification({
      title: "¡Reconectado!",
      message: "Se ha reestablecido la conexión con la partida",
      type: "success"
    }),
  
  correctAnswer: (points: number) => 
    showNotification({
      title: "¡Respuesta correcta!",
      message: `Has ganado ${points} puntos`,
      type: "success",
      duration: 3000
    }),
  
  wrongAnswer: () => 
    showNotification({
      title: "Respuesta incorrecta",
      message: "Sigue intentándolo en la próxima pregunta",
      type: "error",
      duration: 3000
    }),
  
  gameStarting: () => 
    showNotification({
      title: "¡Partida iniciando!",
      message: "Prepárate para la primera pregunta",
      type: "info",
      duration: 3000
    }),
  
  gameCompleted: (position: number) => 
    showNotification({
      title: "¡Partida completada!",
      message: `Has quedado en la posición #${position}`,
      type: "info",
      duration: 5000
    }),
  
  resultsSaved: () => 
    showNotification({
      title: "Resultados guardados",
      message: "Tus estadísticas han sido actualizadas",
      type: "success"
    }),
  
  joinedGame: (gameTitle: string) => 
    showNotification({
      title: "¡Te has unido a la partida!",
      message: `Te has unido correctamente a "${gameTitle}"`,
      type: "success"
    }),
};
