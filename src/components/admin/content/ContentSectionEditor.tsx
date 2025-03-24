
import React from 'react';
import { ContentItem } from './ContentManager';
import { Separator } from "@/components/ui/separator";
import ContentItemEditor from './ContentItemEditor';

interface ContentSectionEditorProps {
  sectionName: string;
  contentItems: ContentItem[];
  onUpdateContent: (key: string, value: string) => Promise<void>;
}

const formatSectionName = (name: string): string => {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const ContentSectionEditor = ({ 
  sectionName, 
  contentItems, 
  onUpdateContent 
}: ContentSectionEditorProps) => {
  const formattedSectionName = formatSectionName(sectionName);
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">{formattedSectionName}</h3>
      <Separator className="mb-4" />
      
      <div className="space-y-6">
        {contentItems.map(item => (
          <ContentItemEditor 
            key={item.key}
            contentItem={item}
            onUpdateContent={onUpdateContent}
          />
        ))}
      </div>
    </div>
  );
};

export default ContentSectionEditor;
