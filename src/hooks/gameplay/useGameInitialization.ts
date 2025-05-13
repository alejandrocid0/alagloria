import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { getQuizById } from '@/services/quiz';
import { useAuth } from '@/contexts/AuthContext';
import { Player } from '@/types/game';

export const useGameInitialization = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quizTitle, setQuizTitle] = useState("");
  const [gameQuestions, setGameQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ranking, setRanking] = useState<Player[]>([]);
  const [myRank, setMyRank] = useState(0);
  
  useEffect(() => {
    if (!gameId) {
      navigate('/games');
      return;
    }
    
    // Si no es la demo y no hay usuario, redireccionar a login
    if (gameId !== 'demo-123' && !user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    
    setLoading(true);
    
    const loadQuiz = async () => {
      try {
        const quiz = await getQuizById(gameId);
        
        if (quiz) {
          // Now we're correctly accessing properties on the resolved quiz object
          setGameQuestions(quiz.questions || []);
          setQuizTitle(quiz.title || "");
          
          if (gameId === 'demo-123') {
            toast({
              title: "Modo demostración",
              description: "Estás jugando una partida de demostración",
              variant: "default"
            });
            
            setRanking([
              { id: "1", name: "María G.", points: 1200, rank: 1, lastAnswer: null, avatar: "https://ui-avatars.com/api/?name=Maria+G&background=5D3891&color=fff" },
              { id: "2", name: "Carlos S.", points: 1000, rank: 2, lastAnswer: null, avatar: "https://ui-avatars.com/api/?name=Carlos+S&background=EAC7C7&color=000" },
              { id: "3", name: "Ana R.", points: 850, rank: 3, lastAnswer: null, avatar: "https://ui-avatars.com/api/?name=Ana+R&background=519259&color=fff" },
              { id: "4", name: "David M.", points: 820, rank: 4, lastAnswer: null, avatar: "https://ui-avatars.com/api/?name=David+M&background=C58940&color=fff" },
              { id: "5", name: "Laura P.", points: 700, rank: 5, lastAnswer: null, avatar: "https://ui-avatars.com/api/?name=Laura+P&background=DF7861&color=fff" },
              { id: "6", name: "Miguel A.", points: 650, rank: 6, lastAnswer: null, avatar: "https://ui-avatars.com/api/?name=Miguel+A&background=748DA6&color=fff" },
              { id: "7", name: "Elena C.", points: 620, rank: 7, lastAnswer: null, avatar: "https://ui-avatars.com/api/?name=Elena+C&background=A84448&color=fff" },
              { id: "8", name: "Javier R.", points: 580, rank: 8, lastAnswer: null, avatar: "https://ui-avatars.com/api/?name=Javier+R&background=9A86A4&color=fff" },
              { id: "9", name: "Sofía L.", points: 540, rank: 9, lastAnswer: null, avatar: "https://ui-avatars.com/api/?name=Sofia+L&background=3F4E4F&color=fff" },
              { id: "10", name: "Pablo M.", points: 520, rank: 10, lastAnswer: null, avatar: "https://ui-avatars.com/api/?name=Pablo+M&background=6C4A4A&color=fff" }
            ]);
            setMyRank(5);
          } else {
            const myPlayer: Player = { 
              id: "2", 
              name: user?.user_metadata.name || "Yo", 
              points: 0, 
              rank: 2,
              lastAnswer: null,
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata.name || "Player")}&background=EAC7C7&color=000` 
            };
            
            setRanking([
              { id: "1", name: "Jugador 1", points: 0, rank: 1, lastAnswer: null, avatar: "https://ui-avatars.com/api/?name=J1&background=5D3891&color=fff" },
              myPlayer,
              { id: "3", name: "Jugador 3", points: 0, rank: 3, lastAnswer: null, avatar: "https://ui-avatars.com/api/?name=J3&background=519259&color=fff" },
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
    };
    
    loadQuiz();
  }, [gameId, navigate, user]);

  return {
    gameId,
    quizTitle,
    loading,
    error,
    gameQuestions,
    ranking,
    myRank,
    setRanking,
    setMyRank
  };
};
