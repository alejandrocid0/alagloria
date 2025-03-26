
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import HeaderSection from './finished/HeaderSection';
import WinnersPodium from './finished/WinnersPodium';
import PlayersRankingList from './finished/PlayersRankingList';
import UserStatsCards from './finished/UserStatsCards';
import ActionButtons from './finished/ActionButtons';
import FeedbackDialog from './finished/FeedbackDialog';
import { useGameResultSaver } from './finished/useGameResultSaver';
import { useConfettiEffect } from './result/useConfettiEffect';

interface Player {
  id: string;
  name: string;
  points: number;
  rank: number;
  avatar?: string;
  lastAnswer?: 'correct' | 'incorrect' | null;
}

interface FinishedStateProps {
  gameId: string;
  ranking: Player[];
  myPoints: number;
  myRank: number;
  questions?: any[];
  gameTitle?: string;
}

const FinishedState: React.FC<FinishedStateProps> = ({
  gameId,
  ranking,
  myPoints,
  myRank,
  questions = [],
  gameTitle = "Partida"
}) => {
  const { user } = useAuth();
  const topPlayers = ranking.slice(0, 3);
  const otherPlayers = ranking.slice(3, 10);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  
  // Cálculo de estadísticas
  const correctAnswers = ranking.find(p => p.id === user?.id)?.points ? 
    Math.round(Math.min(ranking.find(p => p.id === user?.id)?.points / 100, questions.length)) : 0;
  const totalAnswers = questions.length;
  
  // Lanzar confetti cuando se muestre el componente
  // Nota: Pasamos true para el parámetro isCorrect para asegurar que se muestre
  // y usamos los myPoints para determinar la intensidad
  useConfettiEffect(true, myPoints);
  
  // Guardar resultados en la base de datos
  useGameResultSaver({
    gameId,
    gameTitle,
    myRank,
    correctAnswers,
    totalAnswers
  });

  // Marcar cuando se completa la animación para poder mostrar elementos adicionales
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      key="finished"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-6"
    >
      <HeaderSection myPoints={myPoints} myRank={myRank} />
      
      {/* Podio de ganadores con animación */}
      <div className="mb-10">
        <motion.h3 
          className="text-lg font-serif font-bold text-gloria-purple text-center mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Ganadores
        </motion.h3>
        
        <WinnersPodium topPlayers={topPlayers} />
        
        {/* Lista de otros jugadores con entrada escalonada */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <PlayersRankingList players={otherPlayers} startPosition={4} />
        </motion.div>
      </div>
      
      {/* Estadísticas y acciones con aparición retrasada para enfatizar el podio primero */}
      <motion.div 
        className="space-y-6"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <UserStatsCards 
          rank={myRank} 
          points={myPoints} 
          playTime={`${totalAnswers}:00`}
        />
        
        {animationComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <ActionButtons onExit={() => setFeedbackDialogOpen(true)} />
          </motion.div>
        )}
      </motion.div>

      {/* Diálogo de feedback */}
      <FeedbackDialog 
        isOpen={feedbackDialogOpen} 
        onOpenChange={setFeedbackDialogOpen}
        gameTitle={gameTitle}
      />
    </motion.div>
  );
};

export default FinishedState;
