import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Clock, Award, Users, AlertTriangle, Check, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Button from '@/components/Button';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const gameQuestions = [
  {
    id: 1,
    question: "¿En qué año se fundó la Hermandad de La Macarena?",
    options: [
      { id: "a", text: "1595" },
      { id: "b", text: "1640" },
      { id: "c", text: "1750" },
      { id: "d", text: "1824" },
      { id: "e", text: "1875" }
    ],
    correctOption: "b"
  },
  {
    id: 2,
    question: "¿Qué día de la Semana Santa realiza su estación de penitencia la Hermandad de El Gran Poder?",
    options: [
      { id: "a", text: "Lunes Santo" },
      { id: "b", text: "Martes Santo" },
      { id: "c", text: "Miércoles Santo" },
      { id: "d", text: "Jueves Santo" },
      { id: "e", text: "Madrugada" }
    ],
    correctOption: "e"
  },
  {
    id: 3,
    question: "¿Quién es el autor de la Virgen de la Esperanza Macarena?",
    options: [
      { id: "a", text: "Juan de Mesa" },
      { id: "b", text: "Pedro Roldán" },
      { id: "c", text: "Anónimo" },
      { id: "d", text: "Martínez Montañés" },
      { id: "e", text: "Luis Álvarez Duarte" }
    ],
    correctOption: "c"
  },
  {
    id: 4,
    question: "¿Cuál es la Hermandad con más nazarenos de la Semana Santa de Sevilla?",
    options: [
      { id: "a", text: "El Gran Poder" },
      { id: "b", text: "La Macarena" },
      { id: "c", text: "El Silencio" },
      { id: "d", text: "La Esperanza de Triana" },
      { id: "e", text: "El Calvario" }
    ],
    correctOption: "b"
  },
  {
    id: 5,
    question: "¿Qué Hermandad tiene el paso por la Catedral de Sevilla más largo?",
    options: [
      { id: "a", text: "La Estrella" },
      { id: "b", text: "El Silencio" },
      { id: "c", text: "La Macarena" },
      { id: "d", text: "La Amargura" },
      { id: "e", text: "La Pasión" }
    ],
    correctOption: "b"
  }
];

const players = [
  { id: 1, name: "María G.", points: 1200, avatar: "https://ui-avatars.com/api/?name=Maria+G&background=5D3891&color=fff" },
  { id: 2, name: "Carlos S.", points: 1000, avatar: "https://ui-avatars.com/api/?name=Carlos+S&background=EAC7C7&color=000" },
  { id: 3, name: "Ana R.", points: 850, avatar: "https://ui-avatars.com/api/?name=Ana+R&background=519259&color=fff" },
  { id: 4, name: "David M.", points: 820, avatar: "https://ui-avatars.com/api/?name=David+M&background=C58940&color=fff" },
  { id: 5, name: "Laura P.", points: 700, avatar: "https://ui-avatars.com/api/?name=Laura+P&background=DF7861&color=fff" },
  { id: 6, name: "Miguel A.", points: 650, avatar: "https://ui-avatars.com/api/?name=Miguel+A&background=748DA6&color=fff" },
  { id: 7, name: "Elena C.", points: 620, avatar: "https://ui-avatars.com/api/?name=Elena+C&background=A84448&color=fff" },
  { id: 8, name: "Javier R.", points: 580, avatar: "https://ui-avatars.com/api/?name=Javier+R&background=9A86A4&color=fff" },
  { id: 9, name: "Sofía L.", points: 540, avatar: "https://ui-avatars.com/api/?name=Sofia+L&background=3F4E4F&color=fff" },
  { id: 10, name: "Pablo M.", points: 520, avatar: "https://ui-avatars.com/api/?name=Pablo+M&background=6C4A4A&color=fff" }
];

type GameState = 'waiting' | 'question' | 'result' | 'leaderboard' | 'finished';

const GamePlay = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [currentState, setCurrentState] = useState<GameState>('waiting');
  const [countdown, setCountdown] = useState(10);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(20);
  const [myPoints, setMyPoints] = useState(0);
  const [ranking, setRanking] = useState(players);
  const [myRank, setMyRank] = useState(5);
  const [lastPoints, setLastPoints] = useState(0);
  
  useEffect(() => {
    if (gameId === 'demo-123') {
      toast({
        title: "Modo demostración",
        description: "Estás jugando una partida de demostración",
        variant: "default"
      });
    }
    
    if (currentState === 'waiting') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setCurrentState('question');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
    
    if (currentState === 'question') {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            if (!selectedOption) {
              setSelectedOption('wrong');
            }
            setCurrentState('result');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
    
    if (currentState === 'result') {
      const timer = setTimeout(() => {
        if (currentQuestion < gameQuestions.length - 1) {
          setCurrentState('leaderboard');
        } else {
          setCurrentState('finished');
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
    
    if (currentState === 'leaderboard') {
      const timer = setTimeout(() => {
        setCurrentQuestion(prev => prev + 1);
        setSelectedOption(null);
        setTimeRemaining(20);
        setCurrentState('question');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [currentState, currentQuestion, selectedOption]);
  
  const handleSelectOption = (optionId: string) => {
    if (selectedOption || currentState !== 'question') return;
    
    const timeBonus = timeRemaining * 10;
    const isCorrect = optionId === gameQuestions[currentQuestion].correctOption;
    
    setSelectedOption(optionId);
    
    if (isCorrect) {
      const pointsEarned = 100 + timeBonus;
      setLastPoints(pointsEarned);
      setMyPoints(prev => prev + pointsEarned);
      
      const newRanking = [...ranking];
      const myPosition = newRanking.findIndex(player => player.id === 2);
      newRanking[myPosition].points += pointsEarned;
      
      newRanking.sort((a, b) => b.points - a.points);
      setRanking(newRanking);
      
      const newRank = newRanking.findIndex(player => player.id === 2) + 1;
      setMyRank(newRank);
      
      toast({
        title: "¡Respuesta correcta!",
        description: `Has ganado ${pointsEarned} puntos`,
        variant: "default"
      });
    } else {
      toast({
        title: "Respuesta incorrecta",
        description: "No has ganado puntos en esta pregunta",
        variant: "destructive"
      });
    }
    
    setCurrentState('result');
  };
  
  const currentQuestionData = gameQuestions[currentQuestion];
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gloria-purple text-white px-6 py-4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <h1 className="text-xl md:text-2xl font-serif font-bold">
                  {gameId === 'demo-123' ? 'Partida de Demostración' : 'Trivia Semana Santa 2023'}
                </h1>
                
                <div className="flex items-center space-x-4 mt-2 md:mt-0">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    <span>98 jugadores</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    <span>200€ en premios</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">
                    Pregunta {currentQuestion + 1} de {gameQuestions.length}
                  </span>
                  
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">Puntos: </span>
                    <span className="text-lg font-semibold text-gloria-purple">{myPoints}</span>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-gloria-gold h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${((currentQuestion + 1) / gameQuestions.length) * 100}%` }}
                  />
                </div>
              </div>
              
              <AnimatePresence mode="wait">
                {currentState === 'waiting' && (
                  <motion.div 
                    key="waiting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-10"
                  >
                    <div className="mb-6">
                      <h2 className="text-2xl font-serif font-bold text-gloria-purple mb-2">
                        Preparados, listos...
                      </h2>
                      <p className="text-gray-600">
                        La partida comenzará en breve. Prepárate para responder rápido.
                      </p>
                    </div>
                    
                    <div className="w-24 h-24 rounded-full bg-gloria-purple flex items-center justify-center mx-auto">
                      <span className="text-3xl font-bold text-white">{countdown}</span>
                    </div>
                    
                    <div className="mt-8 max-w-md mx-auto">
                      <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex items-start">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                        <div className="text-left">
                          <p className="text-sm text-gray-700">
                            Recuerda que debes responder correctamente y lo más rápido posible para 
                            conseguir más puntos. ¡Suerte!
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {currentState === 'question' && (
                  <motion.div 
                    key="question"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 text-gloria-purple mr-2" />
                          <span className={cn(
                            "font-semibold",
                            timeRemaining <= 5 ? "text-red-500" : "text-gloria-purple"
                          )}>
                            {timeRemaining} segundos
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-500">
                          Ranking: {myRank}º
                        </div>
                      </div>
                      
                      <h2 className="text-xl md:text-2xl font-serif font-semibold text-gloria-purple mb-6">
                        {currentQuestionData.question}
                      </h2>
                      
                      <div className="grid gap-3">
                        {currentQuestionData.options.map((option) => (
                          <button
                            key={option.id}
                            className={cn(
                              "w-full text-left p-4 rounded-lg border transition-all duration-200",
                              selectedOption === option.id
                                ? "border-gloria-purple bg-gloria-purple/10"
                                : "border-gray-200 hover:border-gloria-purple/50 hover:bg-gloria-purple/5"
                            )}
                            onClick={() => handleSelectOption(option.id)}
                            disabled={selectedOption !== null}
                          >
                            <div className="flex items-center">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center mr-3 font-medium text-sm",
                                selectedOption === option.id
                                  ? "bg-gloria-purple text-white"
                                  : "bg-gray-100 text-gray-700"
                              )}>
                                {option.id.toUpperCase()}
                              </div>
                              <span className="text-gray-800 font-medium">{option.text}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {currentState === 'result' && (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="text-center py-6"
                  >
                    <div className="mb-8">
                      <h2 className="text-xl md:text-2xl font-serif font-semibold text-gloria-purple mb-4">
                        {currentQuestionData.question}
                      </h2>
                      
                      <div className="grid gap-3">
                        {currentQuestionData.options.map((option) => {
                          const isCorrect = option.id === currentQuestionData.correctOption;
                          const isSelected = selectedOption === option.id;
                          
                          return (
                            <div
                              key={option.id}
                              className={cn(
                                "w-full text-left p-4 rounded-lg border",
                                isCorrect
                                  ? "border-green-500 bg-green-50"
                                  : isSelected
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-200"
                              )}
                            >
                              <div className="flex items-center">
                                <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center mr-3 font-medium text-sm",
                                  isCorrect
                                    ? "bg-green-500 text-white"
                                    : isSelected
                                      ? "bg-red-500 text-white"
                                      : "bg-gray-100 text-gray-700"
                                )}>
                                  {isCorrect ? (
                                    <Check className="h-4 w-4" />
                                  ) : isSelected ? (
                                    <X className="h-4 w-4" />
                                  ) : (
                                    option.id.toUpperCase()
                                  )}
                                </div>
                                <span className="text-gray-800 font-medium">{option.text}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {selectedOption === currentQuestionData.correctOption ? (
                      <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-center">
                        <Check className="w-6 h-6 text-green-500 mx-auto mb-2" />
                        <h3 className="text-lg font-medium text-green-800 mb-1">¡Respuesta correcta!</h3>
                        <p className="text-sm text-green-600">Has ganado {lastPoints} puntos</p>
                      </div>
                    ) : (
                      <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-center">
                        <X className="w-6 h-6 text-red-500 mx-auto mb-2" />
                        <h3 className="text-lg font-medium text-red-800 mb-1">Respuesta incorrecta</h3>
                        <p className="text-sm text-red-600">La respuesta correcta era: {
                          currentQuestionData.options.find(
                            option => option.id === currentQuestionData.correctOption
                          )?.text
                        }</p>
                      </div>
                    )}
                  </motion.div>
                )}
                
                {currentState === 'leaderboard' && (
                  <motion.div 
                    key="leaderboard"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="text-center py-6"
                  >
                    <h2 className="text-xl md:text-2xl font-serif font-semibold text-gloria-purple mb-6">
                      Tabla de Clasificación
                    </h2>
                    
                    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                      <div className="grid grid-cols-12 bg-gray-100 py-2 px-4">
                        <div className="col-span-1 text-left font-medium text-gray-500 text-sm">#</div>
                        <div className="col-span-7 text-left font-medium text-gray-500 text-sm">Jugador</div>
                        <div className="col-span-4 text-right font-medium text-gray-500 text-sm">Puntos</div>
                      </div>
                      
                      <div className="divide-y divide-gray-200">
                        {ranking.slice(0, 10).map((player, index) => (
                          <motion.div 
                            key={player.id}
                            className={cn(
                              "grid grid-cols-12 py-3 px-4 items-center",
                              player.id === 2 ? "bg-gloria-purple/10" : index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            )}
                            initial={{ backgroundColor: index < 3 ? "rgba(234, 179, 8, 0.2)" : "" }}
                            animate={{ backgroundColor: player.id === 2 ? "rgba(93, 56, 145, 0.1)" : index < 3 ? "rgba(234, 179, 8, 0.1)" : "" }}
                            transition={{ duration: 0.5 }}
                          >
                            <div className="col-span-1 font-semibold text-gray-700">
                              {index + 1}
                            </div>
                            <div className="col-span-7 flex items-center">
                              <img 
                                src={player.avatar} 
                                alt={player.name} 
                                className="w-8 h-8 rounded-full mr-3" 
                              />
                              <span className={cn(
                                "font-medium",
                                player.id === 2 ? "text-gloria-purple" : "text-gray-800"
                              )}>
                                {player.id === 2 ? "Tú" : player.name}
                              </span>
                            </div>
                            <div className="col-span-4 text-right font-semibold text-gray-800">
                              {player.points.toLocaleString()}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-6 text-sm text-gray-500">
                      Siguiente pregunta en 5 segundos...
                    </div>
                  </motion.div>
                )}
                
                {currentState === 'finished' && (
                  <motion.div 
                    key="finished"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="text-center py-10"
                  >
                    <div className="mb-8">
                      <h2 className="text-2xl md:text-3xl font-serif font-bold text-gloria-purple mb-4">
                        ¡Partida Finalizada!
                      </h2>
                      
                      <p className="text-gray-600 mb-6">
                        Gracias por participar. Aquí tienes los resultados finales.
                      </p>
                      
                      <div className="bg-gloria-cream/20 rounded-lg p-6 mb-8">
                        <div className="mb-4">
                          <span className="text-sm text-gray-500">Tu puntuación final</span>
                          <div className="text-4xl font-bold text-gloria-purple">
                            {myPoints}
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <span className="text-sm text-gray-500">Tu posición final</span>
                          <div className="text-2xl font-bold text-gloria-purple">
                            {myRank}º lugar
                          </div>
                        </div>
                        
                        {myRank <= 3 ? (
                          <div className="bg-gloria-gold/20 rounded-lg p-4 mt-6">
                            <div className="flex items-center justify-center">
                              <Award className="h-6 w-6 text-gloria-gold mr-2" />
                              <span className="text-lg font-semibold text-gloria-gold">
                                ¡Felicidades! Has ganado un premio
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                              El premio será transferido a tu cuenta en las próximas 48 horas.
                            </p>
                          </div>
                        ) : (
                          <div className="text-gray-600 mt-4">
                            Sigue participando en más partidas para ganar premios.
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-serif font-semibold text-gloria-purple mb-4">
                      Clasificación Final
                    </h3>
                    
                    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden mb-8">
                      <div className="divide-y divide-gray-200">
                        {ranking.slice(0, 3).map((player, index) => (
                          <div 
                            key={player.id}
                            className={cn(
                              "flex items-center py-4 px-6",
                              index === 0 ? "bg-yellow-50" : 
                              index === 1 ? "bg-gray-100" : 
                              index === 2 ? "bg-amber-50" : "bg-white"
                            )}
                          >
                            <div className="w-8 h-8 flex items-center justify-center mr-4">
                              {index === 0 ? (
                                <span className="text-2xl">🥇</span>
                              ) : index === 1 ? (
                                <span className="text-2xl">🥈</span>
                              ) : (
                                <span className="text-2xl">🥉</span>
                              )}
                            </div>
                            
                            <div className="flex items-center flex-1">
                              <img 
                                src={player.avatar} 
                                alt={player.name} 
                                className="w-10 h-10 rounded-full mr-3 border-2 border-white shadow-sm" 
                              />
                              <div>
                                <div className="font-medium text-gray-800">
                                  {player.id === 2 ? "Tú" : player.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {player.points.toLocaleString()} puntos
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right font-semibold">
                              {index === 0 ? "100€" : index === 1 ? "60€" : "40€"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button variant="outline" href="/games">
                        Ver más partidas
                      </Button>
                      
                      <Button variant="secondary" href="/games">
                        Volver al inicio
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePlay;
