
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Award, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import QuestionCard from '@/components/QuestionCard';
import Button from '@/components/Button';

interface Player {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  rank: number;
  lastAnswer: 'correct' | 'incorrect' | null;
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
  timeLimit: number;
}

const Game = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | undefined>(undefined);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [players, setPlayers] = useState<Player[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  
  // Mock questions
  const questions: Question[] = [
    {
      id: '1',
      text: '¿Qué hermandad realiza su estación de penitencia el Lunes Santo con un paso de misterio que representa el Beso de Judas?',
      options: [
        'Hermandad de Santa Genoveva',
        'Hermandad de San Gonzalo',
        'Hermandad de la Redención',
        'Hermandad de Santa Marta',
        'Hermandad del Museo'
      ],
      correctOption: 2,
      timeLimit: 20
    },
    {
      id: '2',
      text: '¿Qué advocación mariana es conocida como "La Macarena"?',
      options: [
        'Nuestra Señora de la Esperanza',
        'Nuestra Señora de los Dolores',
        'Nuestra Señora de la Estrella',
        'Nuestra Señora de la Amargura',
        'Nuestra Señora de la Soledad'
      ],
      correctOption: 0,
      timeLimit: 15
    },
    {
      id: '3',
      text: '¿Qué día de la Semana Santa realiza su estación de penitencia la Hermandad de El Silencio?',
      options: [
        'Domingo de Ramos',
        'Lunes Santo',
        'Martes Santo',
        'Miércoles Santo',
        'Madrugá del Jueves al Viernes Santo'
      ],
      correctOption: 4,
      timeLimit: 15
    },
    {
      id: '4',
      text: '¿Cuál de estas hermandades realiza su estación de penitencia el Viernes Santo?',
      options: [
        'La Lanzada',
        'La Carretería',
        'La Soledad de San Buenaventura',
        'El Cachorro',
        'La Mortaja'
      ],
      correctOption: 3,
      timeLimit: 15
    },
    {
      id: '5',
      text: '¿En qué año fue coronada canónicamente la Esperanza Macarena?',
      options: [
        '1946',
        '1964',
        '1972',
        '1987',
        '2000'
      ],
      correctOption: 1,
      timeLimit: 15
    }
  ];
  
  // Mock players data
  useEffect(() => {
    const mockPlayers: Player[] = [
      { id: '1', name: 'Usuario', avatar: '', score: 0, rank: 1, lastAnswer: null },
      { id: '2', name: 'María García', avatar: '', score: 0, rank: 2, lastAnswer: null },
      { id: '3', name: 'Juan Pérez', avatar: '', score: 0, rank: 3, lastAnswer: null },
      { id: '4', name: 'Ana Rodríguez', avatar: '', score: 0, rank: 4, lastAnswer: null },
      { id: '5', name: 'Carlos López', avatar: '', score: 0, rank: 5, lastAnswer: null },
      { id: '6', name: 'Laura Martínez', avatar: '', score: 0, rank: 6, lastAnswer: null },
      { id: '7', name: 'Diego Sánchez', avatar: '', score: 0, rank: 7, lastAnswer: null },
      { id: '8', name: 'Sofía Fernández', avatar: '', score: 0, rank: 8, lastAnswer: null },
    ];
    
    setPlayers(mockPlayers);
  }, []);
  
  const handleAnswer = (optionIndex: number, timeRemaining: number) => {
    setAnswered(true);
    setSelectedOption(optionIndex);
    setTimeLeft(timeRemaining);
    
    const currentQ = questions[currentQuestion];
    let pointsEarned = 0;
    
    // Calculate points based on correct answer and time remaining
    if (optionIndex === currentQ.correctOption) {
      // Base points + time bonus
      pointsEarned = 100 + Math.round((timeRemaining / currentQ.timeLimit) * 100);
      
      // Update player score and last answer status
      setPlayers(prev => {
        const updated = [...prev];
        const userIndex = updated.findIndex(p => p.id === '1');
        
        if (userIndex !== -1) {
          updated[userIndex] = {
            ...updated[userIndex],
            score: updated[userIndex].score + pointsEarned,
            lastAnswer: 'correct'
          };
        }
        
        // Update other players randomly
        updated.forEach((player, index) => {
          if (index !== userIndex) {
            const randomPoints = Math.random() > 0.4 ? Math.round(Math.random() * 200) : 0;
            player.score += randomPoints;
            player.lastAnswer = randomPoints > 0 ? 'correct' : 'incorrect';
          }
        });
        
        // Sort by score and update ranks
        return updated.sort((a, b) => b.score - a.score).map((player, idx) => ({
          ...player,
          rank: idx + 1
        }));
      });
      
      setScore(prev => prev + pointsEarned);
    } else {
      // Set incorrect answer for user
      setPlayers(prev => {
        const updated = [...prev];
        const userIndex = updated.findIndex(p => p.id === '1');
        
        if (userIndex !== -1) {
          updated[userIndex] = {
            ...updated[userIndex],
            lastAnswer: 'incorrect'
          };
        }
        
        // Update other players randomly
        updated.forEach((player, index) => {
          if (index !== userIndex) {
            const randomPoints = Math.random() > 0.4 ? Math.round(Math.random() * 200) : 0;
            player.score += randomPoints;
            player.lastAnswer = randomPoints > 0 ? 'correct' : 'incorrect';
          }
        });
        
        // Sort by score and update ranks
        return updated.sort((a, b) => b.score - a.score).map((player, idx) => ({
          ...player,
          rank: idx + 1
        }));
      });
    }
    
    // Show leaderboard after a short delay
    setTimeout(() => {
      setShowLeaderboard(true);
    }, 2000);
    
    // If this was the last question, mark the game as complete
    if (currentQuestion === questions.length - 1) {
      setTimeout(() => {
        setGameComplete(true);
      }, 4000);
    } else {
      // Start countdown to next question
      setTimeout(() => {
        setCountdown(5);
        
        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev === null || prev <= 1) {
              clearInterval(countdownInterval);
              
              // Move to next question
              setTimeout(() => {
                setShowLeaderboard(false);
                setAnswered(false);
                setSelectedOption(undefined);
                setCurrentQuestion(prev => prev + 1);
                setCountdown(null);
              }, 1000);
              
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, 4000);
    }
  };
  
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
              <motion.div 
                key="game-complete"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="max-w-3xl mx-auto"
              >
                <div className="glass-panel p-8 text-center">
                  <h2 className="text-2xl font-serif font-bold text-gloria-purple mb-6">
                    Clasificación Final
                  </h2>
                  
                  <div className="space-y-6 mb-8">
                    {players.slice(0, 3).map((player, index) => (
                      <div 
                        key={player.id} 
                        className={`flex items-center p-4 rounded-lg ${
                          index === 0 
                            ? 'bg-[#FFD700]/10 border border-[#FFD700]' 
                            : index === 1 
                              ? 'bg-[#C0C0C0]/10 border border-[#C0C0C0]' 
                              : 'bg-[#CD7F32]/10 border border-[#CD7F32]'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-gloria-purple/10 flex items-center justify-center mr-4">
                          <span className={`font-bold ${
                            index === 0 
                              ? 'text-[#FFD700]' 
                              : index === 1 
                                ? 'text-[#C0C0C0]' 
                                : 'text-[#CD7F32]'
                          }`}>
                            {index + 1}
                          </span>
                        </div>
                        
                        <div className="flex-grow">
                          <p className="font-medium text-gloria-purple">{player.name}</p>
                          <p className="text-sm text-gray-500">{player.score} puntos</p>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-bold text-gloria-gold">
                            {index === 0 ? '80€' : index === 1 ? '50€' : '30€'}
                          </p>
                          <p className="text-xs text-gray-500">Premio</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto mb-6">
                    {players.slice(3).map((player) => (
                      <div 
                        key={player.id} 
                        className="flex items-center p-3 rounded-lg border border-gray-200"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                          <span className="text-gray-500 font-medium">{player.rank}</span>
                        </div>
                        
                        <div className="flex-grow">
                          <p className="font-medium text-gloria-purple">{player.name}</p>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-medium">{player.score} puntos</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-center space-x-4">
                    <Button variant="outline" href="/games">
                      Ver más partidas
                    </Button>
                    <Button variant="secondary" href="/">
                      Volver al inicio
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : showLeaderboard ? (
              <motion.div 
                key="leaderboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="max-w-3xl mx-auto"
              >
                <div className="glass-panel p-6 md:p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-serif font-semibold text-gloria-purple">
                      Clasificación
                    </h2>
                    
                    {countdown !== null && (
                      <div className="px-4 py-2 bg-gloria-purple text-white rounded-full text-sm">
                        Siguiente pregunta en {countdown}s
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {players.map((player) => (
                      <div 
                        key={player.id} 
                        className={`flex items-center p-3 rounded-lg transition-all duration-300 ${
                          player.id === '1' ? 'bg-gloria-purple/10 border border-gloria-purple' : 'border border-gray-200'
                        } ${
                          player.lastAnswer === 'correct' 
                            ? 'relative after:absolute after:right-0 after:top-0 after:bg-green-500 after:w-1 after:h-full after:rounded-r-lg'
                            : player.lastAnswer === 'incorrect' 
                              ? 'relative after:absolute after:right-0 after:top-0 after:bg-red-500 after:w-1 after:h-full after:rounded-r-lg'
                              : ''
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-gloria-purple/10 flex items-center justify-center mr-3">
                          <span className={`${
                            player.rank === 1 
                              ? 'text-gloria-gold font-bold' 
                              : player.rank === 2 
                                ? 'text-gray-500 font-bold' 
                                : player.rank === 3 
                                  ? 'text-[#CD7F32] font-bold' 
                                  : 'text-gray-600'
                          }`}>
                            {player.rank}
                          </span>
                        </div>
                        
                        <div className="flex-grow">
                          <p className={`font-medium ${player.id === '1' ? 'text-gloria-purple' : 'text-gray-700'}`}>
                            {player.name}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-medium">{player.score} puntos</p>
                          {player.lastAnswer && (
                            <p className={`text-xs ${
                              player.lastAnswer === 'correct' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {player.lastAnswer === 'correct' ? '+puntos' : 'sin puntos'}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
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
                  correctAnswer={answered ? questions[currentQuestion].correctOption : undefined}
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
