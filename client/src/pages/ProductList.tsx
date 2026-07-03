import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductTable } from '../components/ProductTable';
import { Pagination } from '../components/Pagination';
import { Plus } from 'lucide-react';
import type { Product } from '../types';

export const ProductList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10; // Placeholder

  // Placeholder data
  const mockProducts: Product[] = [
    {
      id: '1234567890abcdef',
      name: 'Winter Puffer Jacket',
      description: 'Warm winter jacket',
      price: 2499,
      category: 'Apparel',
      stock: 342,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'abcdef1234567890',
      name: 'Running Shoes',
      description: 'Lightweight shoes',
      price: 3999,
      category: 'Footwear',
      stock: 89,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const navigate = useNavigate();

  const handleEdit = (product: Product) => {
    navigate(`/products/${product.id}/edit`);
  };

  const handleDelete = (product: Product) => {
    console.log('Delete', product);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your store's inventory and view cache status.</p>
        </div>
        <button 
          onClick={() => navigate('/products/new')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="relative w-64">
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <select className="border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500">
              <option>All Categories</option>
              <option>Apparel</option>
              <option>Footwear</option>
              <option>Electronics</option>
            </select>
          </div>
        </div>

        <ProductTable 
          products={mockProducts} 
          cacheSource="cache" 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
        
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={setCurrentPage} 
        />
      </div>
    </div>
  );
};
