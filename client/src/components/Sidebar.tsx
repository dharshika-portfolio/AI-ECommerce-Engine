
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Search, ShoppingCart, LogOut } from 'lucide-react';

export const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Search (Vector)', path: '/search', icon: Search },
    { name: 'Orders', path: '/orders', icon: ShoppingCart },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col fixed inset-y-0 left-0">
      <div className="p-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-indigo-400" />
          Admin Panel
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-400">
          <span>Admin User</span>
          <button onClick={handleLogout} className="hover:text-white transition-colors" title="Logout">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
