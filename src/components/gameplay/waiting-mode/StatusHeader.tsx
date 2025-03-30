
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Clock } from 'lucide-react';

interface StatusHeaderProps {
  gameTitle: string;
  scheduledTime: string;
  playersCount: number;
  formatDate: (dateString: string) => string;
}

const StatusHeader = ({ 
  gameTitle, 
  scheduledTime, 
  playersCount,
  formatDate 
}: StatusHeaderProps) => {
  return (
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
            <span>{playersCount} {playersCount === 1 ? 'participante' : 'participantes'}</span>
          </div>
        </div>
      </motion.div>
      
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute right-0 bottom-0 transform translate-x-1/4 translate-y-1/4">
          <Clock className="w-64 h-64" />
        </div>
      </div>
    </div>
  );
};

export default StatusHeader;
