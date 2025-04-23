
import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountdownSectionProps {
  countdown: number;
  hasGameStarted: boolean;
  showPulse: boolean;
  isWithinFiveMinutes: boolean;
  formatTimeRemaining: (seconds: number) => string;
}

const CountdownSection = ({ 
  countdown, 
  hasGameStarted, 
  showPulse,
  isWithinFiveMinutes,
  formatTimeRemaining 
}: CountdownSectionProps) => {
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-serif font-bold text-gloria-purple mb-4 flex items-center">
        <Clock className="mr-2 h-5 w-5" />
        Inicio de partida
      </h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Estado:</span>
          <motion.div 
            className={cn(
              "bg-gloria-purple/10 text-gloria-purple font-bold px-4 py-2 rounded-full",
              showPulse && countdown <= 10 && countdown > 0 ? "animate-pulse" : ""
            )}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {hasGameStarted ? 'En curso' : formatTimeRemaining(countdown)}
          </motion.div>
        </div>
        
        {!hasGameStarted && (
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-gloria-purple to-purple-600 rounded-full"
              initial={{ width: '100%' }}
              animate={{ width: `${Math.max(0, Math.min(100, (countdown / 300) * 100))}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        )}
        
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex items-start">
          <div className="text-sm text-yellow-700">
            {hasGameStarted ? (
              <p>La partida ya ha comenzado. Haz clic en "Jugar ahora" para unirte a ella inmediatamente.</p>
            ) : (
              <p>No cierres esta página. La partida comenzará automáticamente cuando se alcance la hora programada.</p>
            )}
          </div>
        </div>
        
        {isWithinFiveMinutes && !hasGameStarted && (
          <div className="mt-4 bg-gloria-purple/5 rounded-lg p-4 text-center">
            <p className="text-gloria-purple font-medium">Estamos a menos de 5 minutos del inicio de la partida</p>
            <p className="text-sm text-gray-600 mt-1">Prepárate para jugar, la partida comenzará automáticamente.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CountdownSection;
