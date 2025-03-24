
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy } from 'lucide-react';
import { useAchievements } from '@/hooks/useAchievements';
import AchievementsList from '../achievements/AchievementsList';

const AchievementsCard = () => {
  const { 
    achievements: cofradeAchievements, 
    loading: cofradeLoading,
    earnedCount: cofradeEarned,
    totalCount: cofradeTotal,
    progress: cofradeProgress
  } = useAchievements('cofrade');
  
  const { 
    achievements: generalAchievements, 
    loading: generalLoading,
    earnedCount: generalEarned,
    totalCount: generalTotal,
    progress: generalProgress
  } = useAchievements('general');
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">
            <div className="flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-gloria-purple" />
              Logros
            </div>
          </CardTitle>
          
          <div className="text-xs text-gray-500">
            {cofradeEarned + generalEarned} de {cofradeTotal + generalTotal} conseguidos
          </div>
        </div>
        <Separator />
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="cofrade">
          <TabsList className="mb-4">
            <TabsTrigger value="cofrade" className="flex-1">
              Cofrades
              <span className="ml-2 bg-gloria-purple/10 text-gloria-purple text-xs px-2 py-0.5 rounded-full">
                {cofradeEarned}/{cofradeTotal}
              </span>
            </TabsTrigger>
            <TabsTrigger value="general" className="flex-1">
              Generales
              <span className="ml-2 bg-gloria-purple/10 text-gloria-purple text-xs px-2 py-0.5 rounded-full">
                {generalEarned}/{generalTotal}
              </span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="cofrade">
            <AchievementsList 
              achievements={cofradeAchievements} 
              loading={cofradeLoading} 
            />
          </TabsContent>
          
          <TabsContent value="general">
            <AchievementsList 
              achievements={generalAchievements} 
              loading={generalLoading} 
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AchievementsCard;
