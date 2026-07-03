import React from 'react';
import { CacheBadge } from './CacheBadge';
import { Edit, Trash2 } from 'lucide-react';
import type { Product } from '../types';

interface ProductTableProps {
  products: Product[];
  cacheSource: 'cache' | 'database';
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({ products, cacheSource, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th className="px-6 py-3">ID</th>
            <th className="px-6 py-3">Name</th>
            <th className="px-6 py-3">Category</th>
            <th className="px-6 py-3">Price</th>
            <th className="px-6 py-3">Stock</th>
            <th className="px-6 py-3">Cache</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b hover:bg-gray-50">
              <td className="px-6 py-4 font-mono text-xs text-gray-500">{product.id.substring(0, 8)}...</td>
              <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
              <td className="px-6 py-4">{product.category}</td>
              <td className="px-6 py-4">₹{product.price.toLocaleString()}</td>
              <td className="px-6 py-4">{product.stock}</td>
              <td className="px-6 py-4">
                <CacheBadge hit={cacheSource === 'cache'} />
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => onEdit(product)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                  title="Edit"
                >
                  <Edit className="w-4 h-4 inline" />
                </button>
                <button
                  onClick={() => onDelete(product)}
                  className="text-red-600 hover:text-red-900"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 inline" />
                </button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                No products found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
