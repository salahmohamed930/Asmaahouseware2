import { useState } from 'react';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../types';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
import { MapPin, Phone, User, CreditCard, CheckCircle2 } from 'lucide-react';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    customer_name: user?.name || '',
    phone: user?.phone || '',
    phone2: '',
    address: user?.address || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('يرجى تسجيل الدخول أولاً');
      return;
    }

    setLoading(true);
    try {
      // 1. Create Order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          customer_name: formData.customer_name,
          phone: formData.phone,
          phone2: formData.phone2,
          address: formData.address,
          status: 'created'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create Order Items and Update Stock
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        product_name_snapshot: item.product?.name || '',
        color_name_snapshot: item.variant?.color_name || '',
        color_hex_snapshot: item.variant?.color_hex || '',
        price_snapshot: user.role === 'wholesale' ? item.variant?.wholesale_price : item.variant?.price,
        quantity: item.quantity
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      // Update Stock (In a real app, this should be a transaction or edge function)
      for (const item of items) {
        const { data: variant } = await supabase
          .from('product_variants')
          .select('quantity')
          .eq('id', item.variant_id)
          .single();
        
        if (variant) {
          await supabase
            .from('product_variants')
            .update({ quantity: variant.quantity - item.quantity })
            .eq('id', item.variant_id);
        }
      }

      await clearCart();
      toast.success('تم إرسال طلبك بنجاح!');
      navigate(`/receipt/${order.id}`);
    } catch (error: any) {
      toast.error(error.message || 'فشل إتمام الطلب');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-black text-gray-900">إتمام الطلب</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6"
          >
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="text-emerald-600" />
              تفاصيل الشحن
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">الاسم بالكامل</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-xl py-3 pr-10 pl-4 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">رقم الهاتف الأساسي</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-xl py-3 pr-10 pl-4 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">رقم هاتف إضافي (اختياري)</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      value={formData.phone2}
                      onChange={(e) => setFormData({...formData, phone2: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-xl py-3 pr-10 pl-4 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">العنوان بالتفصيل</label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-3 text-gray-400" size={18} />
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-xl py-3 pr-10 pl-4 focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
                  />
                </div>
              </div>

              <div className="pt-4">
                <div className="bg-emerald-50 p-4 rounded-2xl flex items-center gap-3 text-emerald-800">
                  <CreditCard size={24} />
                  <div>
                    <p className="font-bold">الدفع عند الاستلام</p>
                    <p className="text-xs opacity-80">هذا هو خيار الدفع الوحيد المتاح حالياً</p>
                  </div>
                  <CheckCircle2 className="mr-auto text-emerald-600" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
              >
                {loading ? 'جاري إرسال الطلب...' : `تأكيد الطلب (${total} ج.م)`}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-xl font-bold text-gray-900">مراجعة المنتجات</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {items.map((item) => {
                const price = user?.role === 'wholesale' ? item.variant?.wholesale_price : item.variant?.price;
                return (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={item.product?.images?.[0]?.image_path || 'https://picsum.photos/seed/product/100/100'} 
                        alt="" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{item.product?.name}</h4>
                      <p className="text-xs text-gray-500">{item.variant?.color_name} × {item.quantity}</p>
                    </div>
                    <span className="font-bold text-emerald-600">{(price || 0) * item.quantity} ج.م</span>
                  </div>
                );
              })}
            </div>
            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">الإجمالي النهائي</span>
                <span className="text-2xl font-black text-emerald-600">{total} ج.م</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
