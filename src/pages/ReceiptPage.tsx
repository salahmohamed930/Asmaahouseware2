import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, Order } from '../types';
import { Printer, ArrowRight, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function ReceiptPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      const { data } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('id', id)
        .single();
      setOrder(data);
      setLoading(false);
    }
    fetchOrder();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-64">جاري التحميل...</div>;
  if (!order) return <div className="text-center py-20">الطلب غير موجود</div>;

  const total = order.items?.reduce((acc, item) => acc + (item.price_snapshot * item.quantity), 0) || 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      {/* Success Message (Hidden on Print) */}
      <div className="print:hidden bg-emerald-50 p-8 rounded-3xl text-center space-y-4 border border-emerald-100">
        <div className="bg-emerald-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
          <CheckCircle2 size={32} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-emerald-900">شكراً لطلبك!</h1>
          <p className="text-emerald-700">تم تسجيل طلبك بنجاح برقم <span className="font-mono font-bold">#{order.id.slice(0, 8)}</span></p>
        </div>
        <div className="flex gap-4 justify-center pt-4">
          <button 
            onClick={handlePrint}
            className="bg-white text-emerald-600 border-2 border-emerald-500 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-50 transition-all"
          >
            <Printer size={20} />
            طباعة الفاتورة
          </button>
          <Link 
            to="/products"
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all"
          >
            متابعة التسوق
            <ArrowRight size={20} className="rotate-180" />
          </Link>
        </div>
      </div>

      {/* 80mm Receipt Content */}
      <div className="receipt-container bg-white p-4 mx-auto border border-gray-200 shadow-sm font-mono text-sm leading-tight text-black" style={{ width: '80mm', minHeight: '100mm' }}>
        <div className="text-center space-y-1 mb-4 border-b border-dashed border-gray-300 pb-4">
          <h2 className="text-xl font-black">أسماء للأدوات المنزلية</h2>
          <p>فاتورة مبيعات</p>
          <p className="text-xs">{format(new Date(order.created_at), 'yyyy-MM-dd HH:mm')}</p>
        </div>

        <div className="space-y-1 mb-4 text-xs">
          <p>رقم الطلب: {order.id.slice(0, 8)}</p>
          <p>العميل: {order.customer_name}</p>
          <p>الهاتف: {order.phone}</p>
          <p>العنوان: {order.address}</p>
        </div>

        <table className="w-full text-xs mb-4">
          <thead>
            <tr className="border-b border-dashed border-gray-300">
              <th className="text-right py-2">المنتج</th>
              <th className="text-center py-2">كم</th>
              <th className="text-left py-2">السعر</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item) => (
              <tr key={item.id}>
                <td className="py-2">
                  {item.product_name_snapshot}
                  <br />
                  <span className="text-[10px] opacity-70">({item.color_name_snapshot})</span>
                </td>
                <td className="text-center py-2">{item.quantity}</td>
                <td className="text-left py-2">{item.price_snapshot * item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-dashed border-gray-300 pt-4 space-y-1">
          <div className="flex justify-between font-bold">
            <span>الإجمالي:</span>
            <span>{total} ج.م</span>
          </div>
          <p className="text-[10px] text-center mt-6 opacity-70 italic">شكراً لزيارتكم!</p>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .receipt-container, .receipt-container * {
            visibility: visible;
          }
          .receipt-container {
            position: absolute;
            left: 0;
            top: 0;
            margin: 0;
            padding: 0;
            border: none;
            box-shadow: none;
            width: 80mm;
          }
          @page {
            size: 80mm auto;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
