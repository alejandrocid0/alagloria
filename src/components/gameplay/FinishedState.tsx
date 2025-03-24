
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
import { useConfettiEffect } from './finished/useConfettiEffect';

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
  
  // Cálculo de estadísticas
  const correctAnswers = ranking.find(p => p.id === user?.id)?.points ? 
    Math.round(Math.min(ranking.find(p => p.id === user?.id)?.points / 100, questions.length)) : 0;
  const totalAnswers = questions.length;
  
  // Lanzar confetti cuando se muestre el componente
  useConfettiEffect();
  
  // Guardar resultados en la base de datos
  useGameResultSaver({
    gameId,
    gameTitle,
    myRank,
    correctAnswers,
    totalAnswers
  });

  // Mostrar el diálogo de feedback después de un breve retraso
  useEffect(() => {
    const timer = setTimeout(() => {
      setFeedbackDialogOpen(true);
    }, 1500); // Esperar 1.5 segundos para que el usuario vea primero los resultados
    
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
      
      {/* Podio de ganadores */}
      <div className="mb-10">
        <h3 className="text-lg font-serif font-bold text-gloria-purple text-center mb-6">
          Ganadores
        </h3>
        
        <WinnersPodium topPlayers={topPlayers} />
        
        {/* Lista de otros jugadores */}
        <PlayersRankingList players={otherPlayers} startPosition={4} />
      </div>
      
      {/* Estadísticas y acciones */}
      <div className="space-y-6">
        <UserStatsCards rank={myRank} points={myPoints} />
        <ActionButtons />
      </div>

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
