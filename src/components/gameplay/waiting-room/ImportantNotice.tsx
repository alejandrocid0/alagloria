
import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ImportantNoticeProps {
  hasGameStarted: boolean;
}

const ImportantNotice = ({ hasGameStarted }: ImportantNoticeProps) => {
  return (
    <motion.div 
      className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex items-start"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-yellow-700">
        <p className="font-medium mb-1">Importante</p>
        {hasGameStarted ? (
          <p>La partida ya ha comenzado. Haz clic en "Jugar ahora" para unirte a ella inmediatamente.</p>
        ) : (
          <p>No cierres esta página. La partida comenzará automáticamente cuando se alcance la hora programada.</p>
        )}
      </div>
    </motion.div>
  );
};

export default ImportantNotice;
