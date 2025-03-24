
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

interface HeaderSectionProps {
  myPoints: number;
  myRank: number;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({ myPoints, myRank }) => {
  return (
    <div className="text-center mb-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="inline-block bg-glory-gold/20 p-4 rounded-full mb-4"
      >
        <Trophy className="w-12 h-12 text-gloria-gold" />
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-gloria-purple mb-2">
          ¡Partida completada!
        </h2>
        
        <p className="text-gray-600 max-w-md mx-auto">
          Has finalizado la partida con <span className="font-bold text-gloria-purple">{myPoints} puntos</span> y 
          has quedado en el puesto <span className="font-bold text-gloria-purple">#{myRank}</span>.
        </p>
      </motion.div>
    </div>
  );
};

export default HeaderSection;
