import { useState } from 'react';
import { SearchBar } from '../components/SearchBar';
import { SearchResults } from '../components/SearchResults';

export const VectorSearchPage = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [timeMs, setTimeMs] = useState(0);

  const handleSearch = (searchQuery: string) => {
    setIsSearching(true);
    setQuery(searchQuery);
    
    // Simulate API call
    setTimeout(() => {
      setResults([
        {
          id: '123',
          name: 'Winter Puffer Jacket',
          category: 'Apparel',
          price: 2499,
          score: 0.94,
          description: 'Warm winter jacket',
          stock: 342,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '456',
          name: 'Sherpa Fleece Pullover',
          category: 'Apparel',
          price: 1899,
          score: 0.88,
          description: 'Fleece pullover',
          stock: 120,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]);
      setTimeMs(42);
      setIsSearching(false);
    }, 600);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">AI Vector Search</h1>
        <p className="mt-1 text-sm text-gray-500">Test semantic search capabilities using MongoDB Atlas Vector Search.</p>
      </div>

      <div className="py-8">
        <SearchBar onSearch={handleSearch} isSearching={isSearching} />
        <SearchResults results={results} query={query} timeMs={timeMs} />
      </div>
    </div>
  );
};
