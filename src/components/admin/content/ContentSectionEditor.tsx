
import React from 'react';
import { Separator } from "@/components/ui/separator";
import ContentItemEditor from './ContentItemEditor';
import { ContentItem } from './ContentItemEditor';

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
    <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg">
      <h3 className="text-lg font-medium mb-4 text-gloria-purple">{formattedSectionName}</h3>
      <Separator className="mb-6" />
      
      <div className="space-y-8">
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
