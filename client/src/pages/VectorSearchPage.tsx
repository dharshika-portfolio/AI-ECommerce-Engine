import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SearchBar } from '../components/SearchBar';
import { SearchResults } from '../components/SearchResults';
import api from '../api/axiosInstance';

export const VectorSearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isFetching, isError } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: async () => {
      const response = await api.get(`/products/search?q=${encodeURIComponent(searchQuery)}`);
      return response.data;
    },
    enabled: !!searchQuery,
  });

  const results = data?.data || [];
  const cacheSource = data?.source || 'database';

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">AI Vector Search</h1>
        <p className="mt-1 text-sm text-gray-500">
          Test semantic search capabilities using MongoDB Atlas Vector Search.
          {searchQuery && (
            <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${cacheSource === 'cache' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {cacheSource === 'cache' ? '⚡ From Cache' : '🗄️ From Database'}
            </span>
          )}
        </p>
      </div>

      {isError && (
        <div className="max-w-2xl mx-auto mb-4 p-3 text-sm text-red-700 bg-red-50 rounded-md border border-red-200">
          Search failed. The Vector Search index may not be set up yet, or the server is unavailable.
        </div>
      )}

      <div className="py-4">
        <SearchBar onSearch={setSearchQuery} isSearching={isFetching} />
        <SearchResults results={results} query={searchQuery} />
      </div>
    </div>
  );
};

