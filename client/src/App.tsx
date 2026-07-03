import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { ProductList } from './pages/ProductList';
import { ProductFormPage } from './pages/ProductFormPage';
import { VectorSearchPage } from './pages/VectorSearchPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<div className="p-8 text-center">Login Page Placeholder</div>} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/new" element={<ProductFormPage />} />
            <Route path="/products/:id/edit" element={<ProductFormPage />} />
            <Route path="/search" element={<VectorSearchPage />} />
            <Route path="/orders" element={<div className="p-4"><h1 className="text-2xl font-bold text-gray-900">Orders</h1><p className="mt-2 text-gray-600">Placeholder</p></div>} />
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
