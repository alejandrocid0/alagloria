
import React from 'react';
import ContentSectionEditor from './ContentSectionEditor';
import { Skeleton } from "@/components/ui/skeleton";
import { ContentItem } from './ContentItemEditor';

interface ContentPageEditorProps {
  pageId: string;
  contentItems: ContentItem[];
  isLoading: boolean;
  onUpdateContent: (key: string, value: string) => Promise<void>;
}

const ContentPageEditor = ({ 
  pageId, 
  contentItems, 
  isLoading, 
  onUpdateContent 
}: ContentPageEditorProps) => {
  // Agrupar elementos por sección
  const groupedItems = contentItems.reduce((acc, item) => {
    const section = item.section;
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(item);
    return acc;
  }, {} as Record<string, ContentItem[]>);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  if (contentItems.length === 0) {
    return (
      <div className="bg-slate-50 p-6 rounded-lg text-center">
        <p className="text-slate-500">No hay contenido disponible para esta página.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedItems).map(([section, items]) => (
        <ContentSectionEditor 
          key={`${pageId}-${section}`}
          sectionName={section}
          contentItems={items}
          onUpdateContent={onUpdateContent}
        />
      ))}
    </div>
  );
};

export default ContentPageEditor;
