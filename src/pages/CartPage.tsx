import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="bg-emerald-50 p-8 rounded-full text-emerald-600">
          <ShoppingBag size={64} />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">سلة التسوق فارغة</h2>
          <p className="text-gray-500">ابدأ بإضافة بعض المنتجات الرائعة لمنزلك</p>
        </div>
        <Link 
          to="/products" 
          className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all"
        >
          تصفح المنتجات
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-black text-gray-900">سلة التسوق</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const price = user?.role === 'wholesale' ? item.variant?.wholesale_price : item.variant?.price;
            return (
              <motion.div 
                layout
                key={item.id}
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4"
              >
                <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                  <img 
                    src={item.product?.images?.[0]?.image_path || 'https://picsum.photos/seed/product/200/200'} 
                    alt={item.product?.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900">{item.product?.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div 
                          className="w-3 h-3 rounded-full border border-gray-200" 
                          style={{ backgroundColor: item.variant?.color_hex }}
                        />
                        <span className="text-xs text-gray-500">{item.variant?.color_name}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div className="flex items-center bg-gray-50 rounded-lg p-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-md transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-md transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="text-left">
                      <span className="text-lg font-black text-emerald-600">{price! * item.quantity} ج.م</span>
                      <p className="text-[10px] text-gray-400">{price} ج.م للقطعة</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <h3 className="text-xl font-bold text-gray-900">ملخص الطلب</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>عدد المنتجات</span>
                <span>{items.length}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>الشحن</span>
                <span className="text-emerald-600 font-bold">مجاني</span>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">الإجمالي</span>
                <span className="text-2xl font-black text-emerald-600">{total} ج.م</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
            >
              إتمام الطلب
              <ArrowRight size={20} className="rotate-180" />
            </button>
          </div>

          <div className="bg-emerald-50 p-4 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm">
            <div className="bg-emerald-100 p-2 rounded-full">
              <ShoppingBag size={18} />
            </div>
            <p>الدفع عند الاستلام متاح لجميع الطلبات</p>
          </div>
        </div>
      </div>
    </div>
  );
}
