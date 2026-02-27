import { useEffect, useState } from 'react';
import { supabase, Order } from '../../types';
import { ShoppingBag, Clock, CheckCircle2, Truck, XCircle, Eye, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Link } from 'react-router-dom';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);
    
    if (error) toast.error('فشل تحديث الحالة');
    else {
      toast.success('تم تحديث الحالة بنجاح');
      fetchOrders();
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'created': return { label: 'جديد', color: 'text-blue-600', bg: 'bg-blue-50', icon: Clock };
      case 'processing': return { label: 'تجهيز', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: ShoppingBag };
      case 'shipped': return { label: 'شحن', color: 'text-purple-600', bg: 'bg-purple-50', icon: Truck };
      case 'delivered': return { label: 'توصيل', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 };
      case 'cancelled': return { label: 'ملغي', color: 'text-red-600', bg: 'bg-red-50', icon: XCircle };
      default: return { label: status, color: 'text-gray-600', bg: 'bg-gray-50', icon: Clock };
    }
  };

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-900">إدارة الطلبات</h1>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">الطلب</th>
                <th className="px-6 py-4">العميل</th>
                <th className="px-6 py-4">التاريخ</th>
                <th className="px-6 py-4">الإجمالي</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => {
                const status = getStatusInfo(order.status);
                const total = order.items?.reduce((acc, item) => acc + (item.price_snapshot * item.quantity), 0) || 0;

                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">#{order.id.slice(0, 8)}</td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <p className="font-bold text-gray-900 text-sm">{order.customer_name}</p>
                        <p className="text-xs text-gray-500">{order.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {format(new Date(order.created_at), 'PPP', { locale: ar })}
                    </td>
                    <td className="px-6 py-4 font-black text-emerald-600">{total} ج.م</td>
                    <td className="px-6 py-4">
                      <select 
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1 rounded-full border-none focus:ring-2 focus:ring-emerald-500 ${status.bg} ${status.color}`}
                      >
                        <option value="created">جديد</option>
                        <option value="processing">تجهيز</option>
                        <option value="shipped">شحن</option>
                        <option value="delivered">توصيل</option>
                        <option value="cancelled">ملغي</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link 
                          to={`/receipt/${order.id}`}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="طباعة"
                        >
                          <Printer size={18} />
                        </Link>
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="عرض">
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
