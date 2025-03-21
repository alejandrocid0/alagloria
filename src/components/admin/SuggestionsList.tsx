
import React from 'react';
import { useSuggestions } from '@/hooks/useSuggestions';
import SearchBar from './suggestions/SearchBar';
import SuggestionsTable from './suggestions/SuggestionsTable';
import LoadingState from './suggestions/LoadingState';

const SuggestionsList = () => {
  const { 
    suggestions, 
    loading, 
    searchTerm, 
    setSearchTerm, 
    statusFilter, 
    setStatusFilter, 
    updateSuggestionStatus,
    refreshSuggestions
  } = useSuggestions();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">Buzón de Sugerencias de Usuarios</h2>
      
      <SearchBar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onRefresh={refreshSuggestions}
      />

      {loading ? (
        <LoadingState />
      ) : (
        <SuggestionsTable 
          suggestions={suggestions} 
          onStatusChange={updateSuggestionStatus} 
        />
      )}
    </div>
  );
};

export default SuggestionsList;
