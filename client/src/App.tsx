import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<div className="p-8 text-center">Login Page Placeholder</div>} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<div className="p-4"><h1 className="text-2xl font-bold text-gray-900">Products</h1><p className="mt-2 text-gray-600">Placeholder</p></div>} />
            <Route path="/search" element={<div className="p-4"><h1 className="text-2xl font-bold text-gray-900">Vector Search</h1><p className="mt-2 text-gray-600">Placeholder</p></div>} />
            <Route path="/orders" element={<div className="p-4"><h1 className="text-2xl font-bold text-gray-900">Orders</h1><p className="mt-2 text-gray-600">Placeholder</p></div>} />
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
