
import React from 'react';
import { Player } from '@/types/liveGame';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import CountdownDisplay from './waiting-room/CountdownDisplay';
import GameTimerProgress from './waiting-room/GameTimerProgress';
import ActionButtons from './waiting-room/ActionButtons';
import FinalActions from './waiting-room/FinalActions';
import PlayersListSection from './waiting-room/PlayersListSection';

interface WaitingRoomProps {
  gameTitle: string;
  playersOnline: Player[];
  isGameHost?: boolean;
  countdown: number;
  hasGameStarted: boolean;
  showPulse: boolean;
  isWithinFiveMinutes: boolean;
  formatTimeRemaining: (seconds: number) => string;
  onPlayNow: () => void;
  onStartGame: () => void;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({
  gameTitle,
  playersOnline,
  isGameHost = false,
  countdown,
  hasGameStarted,
  showPulse,
  isWithinFiveMinutes,
  formatTimeRemaining,
  onPlayNow,
  onStartGame,
}) => {
  // Calcular tiempo inicial aproximado para la barra de progreso
  const totalTime = 3600; // Una hora por defecto
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-gloria-purple p-4">
        <h2 className="text-xl font-serif font-bold text-white">{gameTitle}</h2>
        <p className="text-sm text-gloria-purple-100">Sala de espera</p>
      </div>
      
      <div className="p-6">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-serif font-bold text-gloria-purple">
              {hasGameStarted ? 'La partida está en curso' : 'Esperando a que comience la partida'}
            </h3>
            
            <CountdownDisplay
              countdown={countdown}
              hasGameStarted={hasGameStarted}
              showPulse={showPulse}
              formatTimeRemaining={formatTimeRemaining}
            />
          </div>
          
          <GameTimerProgress
            hasGameStarted={hasGameStarted}
            countdown={countdown}
            totalTime={totalTime}
          />
          
          <div className="flex gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex-1">
              <p className="text-sm text-blue-800 font-medium">{playersOnline.length} Participantes</p>
            </div>
            
            <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex-1">
              <p className="text-sm text-green-800 font-medium">Estado: {hasGameStarted ? 'En curso' : isWithinFiveMinutes ? 'Comenzando pronto' : 'Esperando'}</p>
            </div>
          </div>
          
          <ActionButtons
            hasGameStarted={hasGameStarted}
            handlePlayNow={onPlayNow}
          />
        </div>
        
        {/* Usar el componente especializado para la lista de jugadores */}
        <PlayersListSection playersOnline={playersOnline} />
        
        <div className="flex justify-center">
          {isGameHost && !hasGameStarted ? (
            <Button
              onClick={onStartGame}
              className="bg-gloria-purple hover:bg-gloria-purple/90 text-white"
            >
              Iniciar partida
            </Button>
          ) : (
            <FinalActions
              hasGameStarted={hasGameStarted} 
              isWithinFiveMinutes={isWithinFiveMinutes}
              handlePlayNow={onPlayNow}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;
