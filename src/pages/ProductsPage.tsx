import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase, Product, Category } from '../types';
import { Search, Filter, SlidersHorizontal, ShoppingBag, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const categoryId = searchParams.get('category');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [cats, prods] = await Promise.all([
        supabase.from('categories').select('*').eq('is_active', true),
        supabase.from('products')
          .select('*, variants:product_variants(*), images:product_images(*)')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
      ]);

      setCategories(cats.data || []);
      
      let filtered = prods.data || [];
      if (categoryId) {
        filtered = filtered.filter(p => p.category_id === categoryId);
      }
      setProducts(filtered);
      setLoading(false);
    }
    fetchData();
  }, [categoryId]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-black text-gray-900">منتجاتنا</h1>
        
        <div className="flex gap-2">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="ابحث بالاسم أو الكود..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl py-2 pr-10 pl-4 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-xl border transition-all ${showFilters ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-200'}`}
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-wrap gap-2">
              <button
                onClick={() => setSearchParams({})}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${!categoryId ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                الكل
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSearchParams({ category: cat.id })}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${categoryId === cat.id ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-200 animate-pulse rounded-2xl aspect-[3/4]" />
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 space-y-4">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-gray-400">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">لا توجد نتائج</h3>
          <p className="text-gray-500">جرب البحث بكلمات أخرى أو تغيير الفلاتر</p>
        </div>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const mainImage = product.images?.[0]?.image_path || 'https://picsum.photos/seed/product/400/400';
  const minPrice = Math.min(...(product.variants?.map(v => v.price) || [0]));

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
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
            <p className="text-[10px] text-gray-400">كود: {product.code}</p>
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
