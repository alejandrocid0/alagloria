
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ImagePlus } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SEMANA_SANTA_CATEGORIES } from '../schemas/gameFormSchema';
import { GameEditorMetadataProps } from './types';

const GameEditorMetadata: React.FC<GameEditorMetadataProps> = ({
  imageFile,
  imagePreview,
  uploadProgress,
  handleImageChange,
}) => {
  const form = useFormContext();

  const categoryLabels: Record<string, string> = {
    'curiosidades': 'Curiosidades',
    'historia': 'Historia',
    'ediciones-semana-santa': 'Ediciones Semana Santa',
    'misterios': 'Misterios',
    'palios': 'Palios',
    'mundo-costal': 'Mundo Costal'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <FormField
          control={form.control}
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
          control={form.control}
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

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SEMANA_SANTA_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {categoryLabels[category] || category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  <span>{imagePreview ? "Cambiar imagen" : "Seleccionar imagen"}</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageChange}
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
                ></div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        <FormField
          control={form.control}
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
          control={form.control}
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

export default GameEditorMetadata;
