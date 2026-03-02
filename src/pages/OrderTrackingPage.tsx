import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { supabase, Order } from '../types';
import { motion } from 'motion/react';
import { Package, Clock, CheckCircle2, Truck, XCircle, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function OrderTrackingPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;
      const { data } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setOrders(data || []);
      setLoading(false);
    }
    fetchOrders();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'created': return <Clock className="text-blue-500" />;
      case 'processing': return <Package className="text-amber-500" />;
      case 'shipped': return <Truck className="text-indigo-500" />;
      case 'delivered': return <CheckCircle2 className="text-emerald-500" />;
      case 'cancelled': return <XCircle className="text-red-500" />;
      default: return <Clock className="text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'created': return 'تم الاستلام';
      case 'processing': return 'جاري التجهيز';
      case 'shipped': return 'تم الشحن';
      case 'delivered': return 'تم التوصيل';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">جاري التحميل...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-gray-900">طلباتي</h1>
        <div className="bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full text-sm font-bold">
          {orders.length} طلب
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">ليس لديك أي طلبات سابقة</p>
          <Link to="/products" className="text-emerald-600 font-bold hover:underline mt-2 inline-block">ابدأ التسوق الآن</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-gray-900">#{order.id.slice(0, 8)}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(order.created_at), 'd MMMM yyyy', { locale: ar })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <span className="font-bold text-sm">{getStatusText(order.status)}</span>
                  </div>
                </div>

                <div className="text-left">
                  <p className="text-xs text-gray-400">إجمالي الطلب</p>
                  <p className="text-xl font-black text-emerald-600">
                    {order.items?.reduce((acc, item) => acc + (item.price_snapshot * item.quantity), 0)} ج.م
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center">
                <div className="flex -space-x-2 rtl:space-x-reverse">
                  {order.items?.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold overflow-hidden">
                      {item.product_name_snapshot.slice(0, 1)}
                    </div>
                  ))}
                  {(order.items?.length || 0) > 3 && (
                    <div className="w-8 h-8 rounded-full bg-emerald-50 border-2 border-white flex items-center justify-center text-[10px] font-bold text-emerald-600">
                      +{(order.items?.length || 0) - 3}
                    </div>
                  )}
                </div>

                <Link 
                  to={`/receipt/${order.id}`}
                  className="flex items-center gap-1 text-emerald-600 font-bold text-sm hover:gap-2 transition-all"
                >
                  تفاصيل الفاتورة
                  <ChevronLeft size={18} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
