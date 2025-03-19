
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { getQuizById } from '@/services/quizService';
import { QuizQuestion } from '@/types/quiz';
import { useAuth } from '@/contexts/AuthContext';

type GameState = 'waiting' | 'question' | 'result' | 'leaderboard' | 'finished';
type Player = { id: number; name: string; points: number; avatar: string };

export const useGamePlayState = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentState, setCurrentState] = useState<GameState>('waiting');
  const [countdown, setCountdown] = useState(5);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(20);
  const [myPoints, setMyPoints] = useState(0);
  const [ranking, setRanking] = useState<Player[]>([]);
  const [myRank, setMyRank] = useState(0);
  const [lastPoints, setLastPoints] = useState(0);
  const [gameQuestions, setGameQuestions] = useState<QuizQuestion[]>([]);
  const [quizTitle, setQuizTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const startGame = () => {
    setCountdown(0);
    setCurrentState('question');
  };

  useEffect(() => {
    if (!gameId) {
      navigate('/games');
      return;
    }
    
    setLoading(true);
    
    try {
      const quiz = getQuizById(gameId);
      
      if (quiz) {
        setGameQuestions(quiz.questions);
        setQuizTitle(quiz.title);
        
        if (gameId === 'demo-123') {
          toast({
            title: "Modo demostración",
            description: "Estás jugando una partida de demostración",
            variant: "default"
          });
          
          setRanking([
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
          ]);
          setMyRank(5);
        } else {
          const myPlayer = { 
            id: 2, 
            name: user?.user_metadata.name || "Yo", 
            points: 0, 
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata.name || "Player")}&background=EAC7C7&color=000` 
          };
          
          setRanking([
            { id: 1, name: "Jugador 1", points: 0, avatar: "https://ui-avatars.com/api/?name=J1&background=5D3891&color=fff" },
            myPlayer,
            { id: 3, name: "Jugador 3", points: 0, avatar: "https://ui-avatars.com/api/?name=J3&background=519259&color=fff" },
          ]);
          setMyRank(2);
        }
        
        setError(null);
      } else {
        setError("No se encontró el cuestionario");
        toast({
          title: "Error",
          description: "No se encontró el cuestionario",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error("Error al cargar el cuestionario:", err);
      setError("Error al cargar el cuestionario");
      toast({
        title: "Error",
        description: "Ocurrió un error al cargar el cuestionario",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [gameId, navigate, user]);

  useEffect(() => {
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
  }, [currentState, currentQuestion, selectedOption, gameQuestions.length]);

  const handleSelectOption = (optionId: string) => {
    if (selectedOption || currentState !== 'question') return;
    
    const timeBonus = timeRemaining * 10;
    const isCorrect = optionId === gameQuestions[currentQuestion]?.correctOption;
    
    setSelectedOption(optionId);
    
    if (isCorrect) {
      const pointsEarned = 100 + timeBonus;
      setLastPoints(pointsEarned);
      setMyPoints(prev => prev + pointsEarned);
      
      const newRanking = [...ranking];
      const myPosition = newRanking.findIndex(player => player.id === 2);
      
      if (myPosition !== -1) {
        newRanking[myPosition].points += pointsEarned;
        
        newRanking.forEach((player, idx) => {
          if (player.id !== 2) {
            const randomBonus = Math.random() > 0.5 ? Math.floor(Math.random() * pointsEarned) : 0;
            player.points += randomBonus;
          }
        });
        
        newRanking.sort((a, b) => b.points - a.points);
        setRanking(newRanking);
        
        const newRank = newRanking.findIndex(player => player.id === 2) + 1;
        setMyRank(newRank);
      }
      
      toast({
        title: "¡Respuesta correcta!",
        description: `Has ganado ${pointsEarned} puntos`,
        variant: "default"
      });
    } else {
      if (gameId !== 'demo-123') {
        const newRanking = [...ranking];
        newRanking.forEach((player, idx) => {
          if (player.id !== 2) {
            const randomBonus = Math.random() > 0.3 ? Math.floor(Math.random() * 200) : 0;
            player.points += randomBonus;
          }
        });
        
        newRanking.sort((a, b) => b.points - a.points);
        setRanking(newRanking);
        
        const newRank = newRanking.findIndex(player => player.id === 2) + 1;
        setMyRank(newRank);
      }
      
      toast({
        title: "Respuesta incorrecta",
        description: "No has ganado puntos en esta pregunta",
        variant: "destructive"
      });
    }
    
    setCurrentState('result');
  };

  return {
    gameId,
    quizTitle,
    loading,
    error,
    currentState,
    countdown,
    currentQuestion,
    selectedOption,
    timeRemaining,
    myPoints,
    ranking,
    myRank,
    lastPoints,
    gameQuestions,
    startGame,
    handleSelectOption
  };
};

export default useGamePlayState;
