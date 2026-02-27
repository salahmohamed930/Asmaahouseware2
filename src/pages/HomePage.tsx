import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, Product, Category } from '../types';
import { motion } from 'motion/react';
import { ChevronLeft, Star, ShoppingBag } from 'lucide-react';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [cats, prods] = await Promise.all([
        supabase.from('categories').select('*').eq('is_active', true).limit(6),
        supabase.from('products')
          .select('*, variants:product_variants(*), images:product_images(*)')
          .eq('is_active', true)
          .limit(8)
      ]);
      setCategories(cats.data || []);
      setFeaturedProducts(prods.data || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64">جاري التحميل...</div>;

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-emerald-900 text-white p-8 md:p-16">
        <div className="relative z-10 max-w-2xl space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold leading-tight"
          >
            أفضل الأدوات المنزلية <br /> <span className="text-emerald-400">بأفضل الأسعار</span>
          </motion.h1>
          <p className="text-lg opacity-90">
            اكتشف مجموعتنا الواسعة من مستلزمات المطبخ والمنزل. جودة عالية وأسعار منافسة للقطاعي والجملة.
          </p>
          <Link 
            to="/products" 
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105"
          >
            تسوق الآن
            <ChevronLeft size={20} />
          </Link>
        </div>
        <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
          <img 
            src="https://picsum.photos/seed/kitchen/1200/800" 
            alt="Hero" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>

      {/* Categories */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">الأقسام</h2>
          <Link to="/products" className="text-emerald-600 hover:underline text-sm font-medium">عرض الكل</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link 
              key={cat.id} 
              to={`/products?category=${cat.id}`}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <ShoppingBag size={24} />
              </div>
              <span className="font-bold text-gray-700">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">وصل حديثاً</h2>
          <Link to="/products" className="text-emerald-600 hover:underline text-sm font-medium">عرض الكل</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const mainImage = product.images?.[0]?.image_path || 'https://picsum.photos/seed/product/400/400';
  const minPrice = Math.min(...(product.variants?.map(v => v.price) || [0]));

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group"
    >
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden">
        <img 
          src={mainImage} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold text-emerald-600">
          <Star size={12} fill="currentColor" />
          4.5
        </div>
      </Link>
      <div className="p-4 space-y-2">
        <Link to={`/product/${product.id}`} className="block font-bold text-gray-800 hover:text-emerald-600 transition-colors line-clamp-1">
          {product.name}
        </Link>
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <span className="text-lg font-black text-emerald-600">{minPrice} ج.م</span>
            <p className="text-[10px] text-gray-400">متوفر {product.variants?.length} ألوان</p>
          </div>
          <Link 
            to={`/product/${product.id}`}
            className="bg-gray-100 hover:bg-emerald-600 hover:text-white p-2 rounded-xl transition-all"
          >
            <ShoppingBag size={20} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
