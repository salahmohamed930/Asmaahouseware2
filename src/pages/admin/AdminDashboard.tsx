import { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { supabase } from '../../types';
import { 
  LayoutDashboard, 
  Package, 
  List, 
  Users, 
  ShoppingCart, 
  Plus, 
  Settings,
  ChevronLeft
} from 'lucide-react';

// Admin Sub-pages (Simplified for this example)
import AdminOverview from './AdminOverview';
import AdminProducts from './AdminProducts';
import AdminCategories from './AdminCategories';
import AdminOrders from './AdminOrders';
import AdminUsers from './AdminUsers';

export default function AdminDashboard() {
  const { user } = useAuth();
  const location = useLocation();

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-20 space-y-4">
        <h1 className="text-2xl font-bold text-red-600">غير مصرح لك بالدخول</h1>
        <Link to="/" className="text-emerald-600 hover:underline">العودة للرئيسية</Link>
      </div>
    );
  }

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'نظرة عامة' },
    { path: '/admin/products', icon: Package, label: 'المنتجات' },
    { path: '/admin/categories', icon: List, label: 'الأقسام' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'الطلبات' },
    { path: '/admin/users', icon: Users, label: 'المستخدمين' },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Admin Sidebar */}
      <aside className="lg:w-64 flex-shrink-0">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
          <div className="p-6 border-b border-gray-50">
            <h2 className="font-black text-gray-900 flex items-center gap-2">
              <Settings className="text-emerald-600" size={20} />
              لوحة الإدارة
            </h2>
          </div>
          <nav className="p-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                    isActive 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' 
                      : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                  }`}
                >
                  <item.icon size={20} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Admin Content */}
      <div className="flex-1 min-w-0">
        <Routes>
          <Route index element={<AdminOverview />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
        </Routes>
      </div>
    </div>
  );
}
