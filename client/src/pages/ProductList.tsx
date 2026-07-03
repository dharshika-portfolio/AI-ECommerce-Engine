import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductTable } from '../components/ProductTable';
import { Pagination } from '../components/Pagination';
import { Plus } from 'lucide-react';
import type { Product } from '../types';
import api from '../api/axiosInstance';

export const ProductList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', currentPage],
    queryFn: async () => {
      const response = await api.get(`/products?page=${currentPage}&limit=20`);
      return response.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  const handleEdit = (product: Product) => {
    navigate(`/products/${product.id}/edit`);
  };

  const handleDelete = (product: Product) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(product.id);
    }
  };

  const products = data?.data || [];
  // Assuming the API would ideally return totalPages, for now we can mock totalPages if not present
  const totalPages = data?.totalPages || 10;
  const cacheSource = data?.source === 'cache' ? 'cache' : 'database';

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

        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading products...</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500">Failed to load products.</div>
        ) : (
          <ProductTable 
            products={products} 
            cacheSource={cacheSource} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
          />
        )}
        
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={setCurrentPage} 
        />
      </div>
    </div>
  );
};
