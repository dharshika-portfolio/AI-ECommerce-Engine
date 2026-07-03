import React from 'react';
import { StatCard } from '../components/StatCard';
import { Package, Activity, ShoppingCart } from 'lucide-react';

export const Dashboard = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of your store's performance and cache metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Products"
          value="5,000"
          subtitle="+12 today"
          icon={Package}
          trend="up"
        />
        <StatCard
          title="Cache Hit %"
          value="84.2%"
          subtitle="↑ from 78%"
          icon={Activity}
          trend="up"
        />
        <StatCard
          title="Total Orders"
          value="128"
          subtitle="+4 today"
          icon={ShoppingCart}
          trend="up"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Recent Products</h2>
          <a href="/products" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">View All &rarr;</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Stock</th>
                <th className="px-6 py-3">Cache</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">Winter Jacket</td>
                <td className="px-6 py-4">Apparel</td>
                <td className="px-6 py-4">₹2,499</td>
                <td className="px-6 py-4">342</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> HIT
                  </span>
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">Running Shoes</td>
                <td className="px-6 py-4">Footwear</td>
                <td className="px-6 py-4">₹3,999</td>
                <td className="px-6 py-4">89</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> MISS
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
