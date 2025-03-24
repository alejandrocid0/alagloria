
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy } from 'lucide-react';
import { useUserLevels } from '@/hooks/useUserLevels';
import LevelsList from '../levels/LevelsList';
import LevelIcon from '../levels/LevelIcon';

const UserLevelCard = () => {
  const { 
    levels: cofradeLevels, 
    loading: cofradeLoading,
    currentLevel: cofradeCurrentLevel
  } = useUserLevels('cofrade');
  
  // Por ahora solo tenemos niveles para la categoría 'cofrade',
  // pero la estructura está preparada para soportar más categorías en el futuro
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">
            <div className="flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-gloria-purple" />
              Tu Nivel
            </div>
          </CardTitle>
          
          {cofradeCurrentLevel && (
            <div className="flex items-center">
              <LevelIcon 
                level={cofradeCurrentLevel.level}
                achieved={true}
                isCurrentLevel={true}
                size={24}
              />
              <span className="ml-2 text-sm font-semibold text-gloria-purple">
                {cofradeCurrentLevel.level.name}
              </span>
            </div>
          )}
        </div>
        <Separator />
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="cofrade">
          <TabsList className="mb-4">
            <TabsTrigger value="cofrade" className="flex-1">
              Cofrade
              {cofradeCurrentLevel && (
                <span className="ml-2 bg-gloria-purple/10 text-gloria-purple text-xs px-2 py-0.5 rounded-full">
                  Nivel {cofradeCurrentLevel.level.level_order}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="cofrade">
            <LevelsList 
              levels={cofradeLevels} 
              loading={cofradeLoading} 
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UserLevelCard;
