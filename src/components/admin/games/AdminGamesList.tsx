
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, Eye, Play, Calendar, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistance } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import LiveGameMonitor from './LiveGameMonitor';

interface LiveGame {
  id: string;
  title: string;
  status: string;
  current_question: number;
  participants_count: number;
  answers_count: number;
  started_at: string;
  updated_at: string;
}

const AdminGamesList: React.FC = () => {
  const [games, setGames] = useState<LiveGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  
  // Load all live games
  const loadLiveGames = async () => {
    try {
      setLoading(true);
      
      // Get live games with details
      const { data: liveGames, error: liveGamesError } = await supabase
        .from('live_games')
        .select('id, status, current_question, started_at, updated_at');
      
      if (liveGamesError) throw liveGamesError;
      
      // Get game details
      const gamesWithDetails = await Promise.all(
        (liveGames || []).map(async (game) => {
          // Get game title
          const { data: gameData, error: gameError } = await supabase
            .from('games')
            .select('title')
            .eq('id', game.id)
            .single();
          
          if (gameError) console.error('Error fetching game details:', gameError);
          
          // Get participants count
          const { count: participantsCount, error: participantsError } = await supabase
            .from('game_participants')
            .select('*', { count: 'exact', head: true })
            .eq('game_id', game.id);
          
          if (participantsError) console.error('Error fetching participants count:', participantsError);
          
          // Get answers count
          const { count: answersCount, error: answersError } = await supabase
            .from('live_game_answers')
            .select('*', { count: 'exact', head: true })
            .eq('game_id', game.id);
          
          if (answersError) console.error('Error fetching answers count:', answersError);
          
          return {
            ...game,
            title: gameData?.title || 'Partida sin título',
            participants_count: participantsCount || 0,
            answers_count: answersCount || 0
          };
        })
      );
      
      setGames(gamesWithDetails);
      setError(null);
    } catch (err) {
      console.error('Error loading live games:', err);
      setError('Error al cargar partidas en vivo');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadLiveGames();
    
    // Set up refresh interval
    const intervalId = setInterval(() => {
      loadLiveGames();
    }, 60000); // Refresh every minute
    
    return () => clearInterval(intervalId);
  }, []);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'question':
        return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'result':
        return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'leaderboard':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'finished':
        return 'bg-gray-50 text-gray-600 border-gray-200';
      default:
        return '';
    }
  };
  
  // Get time since last update
  const getTimeAgo = (dateString: string) => {
    try {
      return formatDistance(new Date(dateString), new Date(), {
        addSuffix: true,
        locale: es
      });
    } catch (e) {
      return 'fecha desconocida';
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Partidas en Vivo</CardTitle>
              <CardDescription>Monitoriza las partidas activas</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadLiveGames}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-gloria-purple border-t-transparent rounded-full"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : games.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <p>No hay partidas en vivo en este momento</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedGameId && (
                <div className="mb-6">
                  <LiveGameMonitor key={selectedGameId} />
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedGameId(null)}
                    >
                      Cerrar monitor
                    </Button>
                  </div>
                </div>
              )}
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-center">Jugadores</TableHead>
                    <TableHead className="text-center">Pregunta</TableHead>
                    <TableHead>Última actualización</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {games.map((game) => (
                    <TableRow key={game.id}>
                      <TableCell className="font-medium">{game.title}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={cn("uppercase text-xs", getStatusColor(game.status))}
                        >
                          {game.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {game.participants_count}
                      </TableCell>
                      <TableCell className="text-center">
                        {game.current_question}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-gray-500">
                          {getTimeAgo(game.updated_at)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedGameId(game.id)}
                          >
                            <Activity className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                          >
                            <Link to={`/game/${game.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGamesList;
