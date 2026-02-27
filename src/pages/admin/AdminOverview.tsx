import { useEffect, useState } from 'react';
import { supabase } from '../../types';
import { ShoppingBag, Users, Package, TrendingUp, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    recentOrders: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [orders, users, products, recent] = await Promise.all([
        supabase.from('orders').select('id', { count: 'exact' }),
        supabase.from('users').select('id', { count: 'exact' }),
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5)
      ]);

      setStats({
        totalOrders: orders.count || 0,
        totalUsers: users.count || 0,
        totalProducts: products.count || 0,
        recentOrders: recent.data || []
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) return <div>جاري التحميل...</div>;

  const cards = [
    { label: 'إجمالي الطلبات', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'إجمالي المستخدمين', value: stats.totalUsers, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'إجمالي المنتجات', value: stats.totalProducts, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'معدل النمو', value: '+12%', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-black text-gray-900">نظرة عامة</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`${card.bg} ${card.color} p-4 rounded-2xl`}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{card.label}</p>
              <p className="text-2xl font-black text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Clock className="text-emerald-600" size={20} />
            آخر الطلبات
          </h3>
          <Link to="/admin/orders" className="text-emerald-600 text-sm font-bold hover:underline">عرض الكل</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">رقم الطلب</th>
                <th className="px-6 py-4">العميل</th>
                <th className="px-6 py-4">التاريخ</th>
                <th className="px-6 py-4">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-400">#{order.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{order.customer_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {format(new Date(order.created_at), 'PPP', { locale: ar })}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600">
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
