
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarDays, Trophy, Award, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface GameResult {
  id: string;
  gameTitle: string;
  date: Date;
  position: number;
  correctAnswers: number;
  totalAnswers: number;
  entryFee: number;
}

interface RecentGamesCardProps {
  recentGames: GameResult[];
}

const RecentGamesCard = ({ recentGames }: RecentGamesCardProps) => {
  // Animate items as they enter
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Function to get position styling
  const getPositionStyle = (position: number) => {
    if (position === 1) return "text-yellow-500 font-bold flex items-center";
    if (position === 2) return "text-gray-400 font-bold flex items-center";
    if (position === 3) return "text-amber-700 font-bold flex items-center";
    return "text-gray-600 flex items-center";
  };

  // Function to get color for success rate
  const getSuccessRateColor = (correct: number, total: number) => {
    const rate = (correct / total) * 100;
    if (rate >= 80) return "text-green-600";
    if (rate >= 60) return "text-lime-600";
    if (rate >= 40) return "text-yellow-600";
    if (rate >= 20) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <Card className="shadow-md h-full overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-gloria-purple">
          <CalendarDays className="h-5 w-5" />
          Partidas recientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentGames.length > 0 ? (
          <div className="overflow-auto max-h-[400px]">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partida</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Posición</TableHead>
                    <TableHead>Aciertos</TableHead>
                    <TableHead>Tendencia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentGames.map((game, index) => {
                    // Calculate if this game is better or worse than the previous one
                    const trend = index < recentGames.length - 1 
                      ? (game.position < recentGames[index + 1].position ? 'up' : 
                         game.position > recentGames[index + 1].position ? 'down' : 'same')
                      : 'same';
                    
                    return (
                      <motion.tr
                        key={game.id}
                        variants={itemVariants}
                        className="hover:bg-gray-50"
                      >
                        <TableCell className="font-medium truncate max-w-[150px]">
                          {game.gameTitle}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {new Date(game.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className={getPositionStyle(game.position)}>
                            {game.position === 1 && <Trophy size={14} className="mr-1" />}
                            {game.position === 2 && <Award size={14} className="mr-1" />}
                            {game.position === 3 && <Award size={14} className="mr-1" />}
                            {game.position}º
                          </div>
                        </TableCell>
                        <TableCell className={getSuccessRateColor(game.correctAnswers, game.totalAnswers)}>
                          {game.correctAnswers}/{game.totalAnswers}
                        </TableCell>
                        <TableCell>
                          {trend === 'up' && <TrendingUp size={16} className="text-green-500" />}
                          {trend === 'down' && <TrendingDown size={16} className="text-red-500" />}
                          {trend === 'same' && <span className="text-gray-400">-</span>}
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            </motion.div>
          </div>
        ) : (
          <motion.div 
            className="text-center py-10 text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p>Aún no has participado en ninguna partida</p>
            <p className="mt-2">¡Participa para ver tus estadísticas!</p>
            <motion.div 
              className="mt-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <Trophy size={40} className="mx-auto text-gloria-purple/30" />
            </motion.div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentGamesCard;
