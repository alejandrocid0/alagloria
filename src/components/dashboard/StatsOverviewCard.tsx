
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, CreditCard, BrainCircuit, CalendarDays } from 'lucide-react';

interface StatsOverviewCardProps {
  user: {
    stats: {
      gamesPlayed: Array<{
        position: number;
        entryFee: number;
      }>;
      totalSpent: number;
      correctAnswers: number;
      totalAnswers: number;
    }
  }
}

const StatsOverviewCard = ({ user }: StatsOverviewCardProps) => {
  const { stats } = user;
  
  // Calculate best position
  const bestPosition = stats.gamesPlayed.length > 0
    ? Math.min(...stats.gamesPlayed.map(game => game.position))
    : '-';
    
  // Calculate success ratio
  const successRatio = stats.totalAnswers > 0
    ? ((stats.correctAnswers / stats.totalAnswers) * 100).toFixed(1)
    : '0';
    
  const statsItems = [
    {
      title: 'Partidas jugadas',
      value: stats.gamesPlayed.length,
      icon: CalendarDays,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Mejor posición',
      value: bestPosition,
      icon: Trophy,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Total invertido',
      value: `${stats.totalSpent.toFixed(2)}€`,
      icon: CreditCard,
      color: 'text-green-500',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Ratio de aciertos',
      value: `${successRatio}%`,
      icon: BrainCircuit,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100'
    }
  ];
  
  return (
    <>
      {statsItems.map((item, index) => (
        <Card key={index} className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{item.value}</div>
              <div className={`p-2 rounded-full ${item.bgColor}`}>
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export default StatsOverviewCard;
