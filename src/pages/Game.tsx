
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Award, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import QuestionCard from '@/components/question/QuestionCard';
import LeaderboardPanel from '@/components/game/LeaderboardPanel';
import GameCompletedPanel from '@/components/game/GameCompletedPanel';
import useGameState from '@/hooks/useGameState';

const Game = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const {
    currentQuestion,
    answered,
    selectedOption,
    players,
    showLeaderboard,
    countdown,
    gameComplete,
    handleAnswer,
    questions
  } = useGameState(gameId);
  
  return (
    <>
      <Navbar />
      
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-gloria-purple mb-4">
              {gameComplete ? "¡Partida completada!" : `Pregunta ${currentQuestion + 1} de ${questions.length}`}
            </h1>
            
            {!gameComplete && (
              <div className="flex justify-center space-x-4 mb-4">
                <div className="flex items-center">
                  <Users className="text-gloria-purple mr-2" size={18} />
                  <span className="text-gray-600">{players.length} jugadores</span>
                </div>
                
                <div className="flex items-center">
                  <Award className="text-gloria-gold mr-2" size={18} />
                  <span className="text-gray-600">160€ en premios</span>
                </div>
              </div>
            )}
            
            {!gameComplete && !showLeaderboard && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 max-w-xl mx-auto">
                <div className="flex items-center">
                  <AlertTriangle className="text-yellow-500 mr-2 flex-shrink-0" size={18} />
                  <p className="text-sm text-yellow-700">
                    Responde correctamente y rápido para ganar más puntos. Los puntos se basan en la velocidad de respuesta.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <AnimatePresence mode="wait">
            {gameComplete ? (
              <GameCompletedPanel players={players} />
            ) : showLeaderboard ? (
              <LeaderboardPanel 
                players={players}
                countdown={countdown}
              />
            ) : (
              <motion.div 
                key={`question-${currentQuestion}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <QuestionCard
                  question={questions[currentQuestion].text}
                  options={questions[currentQuestion].options}
                  correctAnswer={answered ? parseInt(questions[currentQuestion].correctOption) : undefined}
                  timeLimit={questions[currentQuestion].timeLimit}
                  onAnswer={handleAnswer}
                  answered={answered}
                  selectedOption={selectedOption}
                  showResult={answered}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default Game;
