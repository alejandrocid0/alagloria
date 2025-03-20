
import { Search, Filter, Tag } from 'lucide-react';

interface GamesFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  filterCategory: string;
  setFilterCategory: (value: string) => void;
}

const GamesFilter = ({ 
  searchTerm, 
  setSearchTerm, 
  filterStatus, 
  setFilterStatus,
  filterCategory,
  setFilterCategory
}: GamesFilterProps) => {
  const categories = [
    { value: "all", label: "Todas las categorías" },
    { value: "historia", label: "Historia" },
    { value: "cultura", label: "Cultura" },
    { value: "deporte", label: "Deporte" },
    { value: "arte", label: "Arte" },
    { value: "ciencia", label: "Ciencia" },
    { value: "cine", label: "Cine y TV" },
    { value: "musica", label: "Música" },
    { value: "geografia", label: "Geografía" },
    { value: "literatura", label: "Literatura" },
    { value: "general", label: "Conocimiento General" }
  ];

  return (
    <div className="flex flex-col md:flex-row justify-between items-stretch gap-4 mb-8">
      <div className="relative flex-grow max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar partidas..."
          className="gloria-input pl-10 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-2">
        <div className="relative">
          <select
            className="gloria-input pl-10 pr-10 appearance-none"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Todas las partidas</option>
            <option value="upcoming">Disponibles</option>
            <option value="full">Completas</option>
            <option value="past">Finalizadas</option>
          </select>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="relative">
          <select
            className="gloria-input pl-10 pr-10 appearance-none"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Tag className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamesFilter;
