
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { BrainCircuit } from 'lucide-react';

interface GameResult {
  id: string;
  correctAnswers: number;
  totalAnswers: number;
}

interface SuccessRatioCardProps {
  correctAnswers: number;
  totalAnswers: number;
  gameHistory: GameResult[];
}

const SuccessRatioCard = ({ correctAnswers, totalAnswers, gameHistory }: SuccessRatioCardProps) => {
  const incorrectAnswers = totalAnswers - correctAnswers;
  
  const pieData = [
    { name: 'Correctas', value: correctAnswers, color: '#4A2A6B' },
    { name: 'Incorrectas', value: incorrectAnswers, color: '#E5E7EB' }
  ].filter(item => item.value > 0);
  
  // Calculate percentage
  const successPercentage = totalAnswers > 0
    ? ((correctAnswers / totalAnswers) * 100).toFixed(1)
    : '0';
  
  // Calculate trend data over last 5 games
  const recentGames = [...gameHistory]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .reverse();
    
  const trendData = recentGames.map(game => {
    const percentage = game.totalAnswers > 0
      ? ((game.correctAnswers / game.totalAnswers) * 100)
      : 0;
    
    return {
      id: game.id,
      ratio: percentage
    };
  });
  
  return (
    <Card className="shadow-md h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gloria-purple">
          <BrainCircuit className="h-5 w-5" />
          Ratio de aciertos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Ratio global</p>
            <p className="text-2xl font-bold">{successPercentage}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Aciertos / Total</p>
            <p className="text-2xl font-bold">
              {correctAnswers} / {totalAnswers}
            </p>
          </div>
        </div>
        
        {totalAnswers > 0 ? (
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={1}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => {
                    const percentage = totalAnswers > 0
                      ? ((Number(value) / totalAnswers) * 100).toFixed(1)
                      : '0';
                    return [`${value} (${percentage}%)`, name];
                  }}
                />
                <Legend 
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>No has respondido ninguna pregunta todavía</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SuccessRatioCard;
