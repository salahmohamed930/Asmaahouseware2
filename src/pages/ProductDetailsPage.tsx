import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, Product, ProductVariant } from '../types';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';
import { motion } from 'motion/react';
import { ShoppingCart, ChevronRight, ChevronLeft, Check, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from('products')
        .select('*, variants:product_variants(*), images:product_images(*)')
        .eq('id', id)
        .single();
      
      if (error || !data) {
        toast.error('المنتج غير موجود');
        navigate('/products');
        return;
      }

      setProduct(data);
      if (data.variants?.length > 0) {
        setSelectedVariant(data.variants[0]);
      }
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-64">جاري التحميل...</div>;
  if (!product) return null;

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addItem(product, selectedVariant, quantity);
  };

  const currentPrice = user?.role === 'wholesale' ? selectedVariant?.wholesale_price : selectedVariant?.price;

  return (
    <div className="space-y-8 pb-20">
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <button onClick={() => navigate(-1)} className="hover:text-emerald-600">المنتجات</button>
        <ChevronLeft size={14} />
        <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-white border border-gray-100">
            <img 
              src={product.images?.[activeImage]?.image_path || 'https://picsum.photos/seed/product/800/800'} 
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {product.images?.map((img, i) => (
              <button 
                key={img.id}
                onClick={() => setActiveImage(i)}
                className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                  activeImage === i ? 'border-emerald-500 scale-105' : 'border-transparent opacity-60'
                }`}
              >
                <img src={img.image_path} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-gray-900">{product.name}</h1>
            <p className="text-gray-500 text-sm">كود المنتج: <span className="font-mono">{product.code}</span></p>
          </div>

          <div className="bg-emerald-50 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-700 font-medium mb-1">السعر الحالي</p>
              <span className="text-4xl font-black text-emerald-600">{currentPrice} ج.م</span>
            </div>
            {user?.role === 'wholesale' && (
              <div className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                سعر الجملة مفعل
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-gray-800">اختر اللون</h3>
            <div className="flex flex-wrap gap-3">
              {product.variants?.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                    selectedVariant?.id === variant.id 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div 
                    className="w-5 h-5 rounded-full border border-gray-200 shadow-sm" 
                    style={{ backgroundColor: variant.color_hex }}
                  />
                  <span className="text-sm font-bold">{variant.color_name}</span>
                  {selectedVariant?.id === variant.id && <Check size={14} className="text-emerald-600" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800">الكمية</h3>
              <span className={`text-xs font-bold ${selectedVariant && selectedVariant.quantity > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {selectedVariant && selectedVariant.quantity > 0 ? `متوفر ${selectedVariant.quantity} قطعة` : 'نفذت الكمية'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-gray-100 rounded-xl p-1">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center font-bold text-xl hover:bg-white rounded-lg transition-colors"
                >
                  -
                </button>
                <span className="w-12 text-center font-bold">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(selectedVariant?.quantity || 1, quantity + 1))}
                  className="w-10 h-10 flex items-center justify-center font-bold text-xl hover:bg-white rounded-lg transition-colors"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.quantity <= 0}
                className="flex-1 bg-emerald-600 text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={20} />
                إضافة للسلة
              </button>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 text-gray-800 font-bold">
              <Info size={18} className="text-emerald-600" />
              الوصف
            </div>
            <p className="text-gray-600 leading-relaxed">
              {product.description || 'لا يوجد وصف متاح لهذا المنتج حالياً.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
