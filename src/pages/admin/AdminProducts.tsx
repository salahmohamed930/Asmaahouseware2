import { useEffect, useState } from 'react';
import { supabase, Product, Category } from '../../types';
import { Plus, Edit2, Trash2, Eye, EyeOff, Search, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [prods, cats] = await Promise.all([
      supabase.from('products').select('*, variants:product_variants(*), images:product_images(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*')
    ]);
    setProducts(prods.data || []);
    setCategories(cats.data || []);
    setLoading(false);
  }

  const toggleStatus = async (product: Product) => {
    const { error } = await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id);
    
    if (error) toast.error('فشل تحديث الحالة');
    else {
      toast.success('تم تحديث الحالة بنجاح');
      fetchData();
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) toast.error('فشل حذف المنتج');
    else {
      toast.success('تم حذف المنتج بنجاح');
      fetchData();
    }
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-black text-gray-900">إدارة المنتجات</h1>
        <button className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
          <Plus size={20} />
          إضافة منتج جديد
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="ابحث بالاسم أو الكود..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-xl py-2 pr-10 pl-4 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">المنتج</th>
                <th className="px-6 py-4">الكود</th>
                <th className="px-6 py-4">القسم</th>
                <th className="px-6 py-4">المخزون</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {product.images?.[0] ? (
                          <img src={product.images[0].image_path} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ImageIcon size={16} />
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-gray-900 text-sm">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{product.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {categories.find(c => c.id === product.category_id)?.name || 'بدون قسم'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold ${product.variants?.reduce((a, b) => a + b.quantity, 0)! > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {product.variants?.reduce((a, b) => a + b.quantity, 0)} قطعة
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleStatus(product)}
                      className={`p-2 rounded-lg transition-colors ${product.is_active ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 bg-gray-100'}`}
                    >
                      {product.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => deleteProduct(product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
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
