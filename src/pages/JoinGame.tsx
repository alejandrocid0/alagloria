
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoadingState from '@/components/gameplay/LoadingState';
import GameDetails from '@/components/join-game/GameDetails';
import JoinGameForm from '@/components/join-game/JoinGameForm';
import SuccessMessage from '@/components/join-game/SuccessMessage';
import { useJoinGame } from '@/hooks/useJoinGame';
import { useIsMobile } from '@/hooks/use-mobile';

const JoinGame = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const isMobile = useIsMobile();
  const { 
    gameData, 
    loading, 
    checkingStatus, 
    paymentComplete, 
    isProcessing, 
    handleJoinGame, 
    formatDate 
  } = useJoinGame(gameId);
  
  if (loading || checkingStatus || !gameData) {
    return (
      <>
        <Navbar />
        <div className="pt-20 md:pt-24 pb-16 bg-gray-50 min-h-screen">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex justify-center items-center min-h-[300px] md:min-h-[400px]">
              <LoadingState message="Cargando información de la partida..." />
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  const formattedDate = formatDate(gameData.date);
  
  return (
    <>
      <Navbar />
      
      <div className="pt-20 md:pt-24 pb-16 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {!paymentComplete ? (
              <div className={`grid grid-cols-1 ${isMobile ? 'gap-6' : 'lg:grid-cols-5 gap-8'}`}>
                <div className={isMobile ? '' : 'lg:col-span-3'}>
                  <GameDetails 
                    gameData={gameData} 
                    formattedDate={formattedDate} 
                    isMobile={isMobile}
                  />
                </div>
                
                <div className={isMobile ? '' : 'lg:col-span-2'}>
                  <JoinGameForm
                    gameData={gameData}
                    formattedDate={formattedDate}
                    isProcessing={isProcessing}
                    handleJoinGame={handleJoinGame}
                    hasJoined={paymentComplete}
                    gameId={gameId || ''}
                  />
                </div>
              </div>
            ) : (
              <SuccessMessage 
                gameData={gameData} 
                formattedDate={formattedDate} 
                gameId={gameId || ''} 
              />
            )}
          </motion.div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default JoinGame;
