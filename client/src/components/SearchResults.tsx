import React from 'react';
import { Product } from '../types';
import { Package } from 'lucide-react';

interface SearchResultItem extends Product {
  score?: number;
}

interface SearchResultsProps {
  results: SearchResultItem[];
  query: string;
  timeMs?: number;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ results, query, timeMs }) => {
  if (!query) return null;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-4 text-sm text-gray-500">
        Results for "{query}" ({results.length} matches{timeMs ? `, ${timeMs}ms` : ''})
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {results.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No results found for your query.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {results.map((item) => (
              <li key={item.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-500">{item.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">₹{item.price.toLocaleString()}</div>
                  {item.score !== undefined && (
                    <div className="text-sm text-emerald-600 font-medium">Score: {item.score.toFixed(2)}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
