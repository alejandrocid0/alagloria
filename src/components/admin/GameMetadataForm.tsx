
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ImagePlus } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GameFormValues } from './schemas/gameFormSchema';

interface GameMetadataFormProps {
  imageFile: File | null;
  imagePreview: string | null;
  uploadProgress: number;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const GameMetadataForm = ({ 
  imageFile, 
  imagePreview, 
  uploadProgress, 
  onImageChange 
}: GameMetadataFormProps) => {
  const { control } = useFormContext<GameFormValues>();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título de la Partida</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Especial Semana Santa 2023" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Breve descripción de la partida"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Imagen de la partida</FormLabel>
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-3">
              <label className="cursor-pointer">
                <div className="flex items-center justify-center w-full h-10 px-4 py-2 text-sm font-medium text-white bg-gloria-purple rounded-md hover:bg-gloria-purple/90">
                  <ImagePlus className="w-4 h-4 mr-2" />
                  <span>Seleccionar imagen</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={onImageChange}
                  />
                </div>
              </label>
              {imageFile && (
                <span className="text-sm text-gray-500">
                  {imageFile.name}
                </span>
              )}
            </div>
            
            {imagePreview && (
              <div className="relative mt-2 rounded-lg overflow-hidden border border-gray-200">
                <img 
                  src={imagePreview} 
                  alt="Vista previa" 
                  className="w-full h-40 object-cover"
                />
              </div>
            )}
            
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-gloria-purple h-2.5 rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        <FormField
          control={control}
          name="gameDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="gameTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hora</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default GameMetadataForm;
