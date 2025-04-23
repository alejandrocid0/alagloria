import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Play, Users } from 'lucide-react';
import PlayersListSection from './waiting-room/PlayersListSection';
import CountdownSection from './waiting-room/CountdownSection';
import GameInfoSection from './waiting-room/GameInfoSection';

interface WaitingRoomProps {
  gameTitle: string;
  playersOnline: any[];
  isGameHost: boolean;
  countdown: number;
  hasGameStarted: boolean;
  showPulse: boolean;
  isWithinFiveMinutes: boolean;
  formatTimeRemaining: (seconds: number) => string;
  onPlayNow: () => Promise<void>;
  onStartGame: () => Promise<void>;
  isLoadingPlayers?: boolean;
}

const WaitingRoom = ({
  gameTitle,
  playersOnline,
  isGameHost,
  countdown,
  hasGameStarted,
  showPulse,
  isWithinFiveMinutes,
  formatTimeRemaining,
  onPlayNow,
  onStartGame,
  isLoadingPlayers = false
}: WaitingRoomProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-2 border-gloria-purple/20 shadow-lg">
        <CardHeader className="bg-gloria-purple/5 border-b border-gloria-purple/20">
          <CardTitle className="text-2xl font-serif text-gloria-purple flex items-center">
            <Clock className="mr-2 h-6 w-6" />
            Sala de espera: {gameTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <GameInfoSection 
                gameTitle={gameTitle}
                isGameHost={isGameHost}
              />
              
              <PlayersListSection 
                playersOnline={playersOnline}
                isLoading={isLoadingPlayers}
              />
            </div>
            
            <div className="space-y-6">
              <CountdownSection 
                countdown={countdown}
                hasGameStarted={hasGameStarted}
                showPulse={showPulse}
                isWithinFiveMinutes={isWithinFiveMinutes}
                formatTimeRemaining={formatTimeRemaining}
              />
              
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-serif font-bold text-gloria-purple mb-4 flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Opciones de juego
                </h3>
                
                <div className="space-y-4">
                  {isGameHost && (
                    <div>
                      <Button 
                        onClick={onStartGame}
                        className="w-full bg-gloria-purple hover:bg-gloria-purple/90"
                        disabled={hasGameStarted || playersOnline.length === 0}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Iniciar partida ahora
                      </Button>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Como anfitrión, puedes iniciar la partida en cualquier momento
                      </p>
                    </div>
                  )}
                  
                  {!isGameHost && (
                    <div>
                      <Button 
                        onClick={onPlayNow}
                        className="w-full bg-gloria-purple hover:bg-gloria-purple/90"
                        disabled={!isWithinFiveMinutes && countdown > 10}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Jugar ahora
                      </Button>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        {isWithinFiveMinutes 
                          ? "La partida comenzará pronto" 
                          : "Espera a que el anfitrión inicie la partida"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WaitingRoom;
