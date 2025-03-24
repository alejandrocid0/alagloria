
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon, SaveIcon, RotateCcw } from 'lucide-react';

export interface ContentItem {
  id: string;
  key: string;
  section: string;
  page: string;
  content: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface ContentItemEditorProps {
  contentItem: ContentItem;
  onUpdateContent: (key: string, value: string) => Promise<void>;
}

const ContentItemEditor = ({ 
  contentItem, 
  onUpdateContent 
}: ContentItemEditorProps) => {
  const [value, setValue] = useState(contentItem.content);
  const [isEdited, setIsEdited] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    setIsEdited(e.target.value !== contentItem.content);
  };
  
  const handleSave = async () => {
    if (!isEdited) return;
    
    setIsSaving(true);
    try {
      await onUpdateContent(contentItem.key, value);
      setIsEdited(false);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleReset = () => {
    setValue(contentItem.content);
    setIsEdited(false);
  };

  // Extraer nombre más legible de la clave
  const keyParts = contentItem.key.split('.');
  const nameFromKey = keyParts[keyParts.length - 1]
    .replace(/-/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  return (
    <Card className="border border-slate-200">
      <CardContent className="pt-6">
        <div className="mb-2 flex justify-between items-center">
          <Label htmlFor={contentItem.key} className="text-base font-medium">
            {nameFromKey}
          </Label>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-4 w-4 text-slate-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-sm">{contentItem.description}</p>
                <p className="text-xs text-slate-400 mt-1">ID: {contentItem.key}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <Textarea
          id={contentItem.key}
          value={value}
          onChange={handleChange}
          className="min-h-24 font-normal"
          placeholder="Introduce el texto aquí..."
        />
      </CardContent>
      
      {isEdited && (
        <CardFooter className="flex justify-end space-x-2 bg-slate-50 py-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            disabled={isSaving}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Deshacer
          </Button>
          
          <Button
            size="sm" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Guardando...
              </>
            ) : (
              <>
                <SaveIcon className="h-4 w-4 mr-2" />
                Guardar
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ContentItemEditor;
