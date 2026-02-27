import { useEffect, useState } from 'react';
import { supabase, Category } from '../../types';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
    setCategories(data || []);
    setLoading(false);
  }

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const { error } = await supabase.from('categories').insert({ name: newCategoryName });
    if (error) toast.error('فشل إضافة القسم');
    else {
      toast.success('تم إضافة القسم بنجاح');
      setNewCategoryName('');
      fetchCategories();
    }
  };

  const toggleStatus = async (category: Category) => {
    const { error } = await supabase
      .from('categories')
      .update({ is_active: !category.is_active })
      .eq('id', category.id);
    
    if (error) toast.error('فشل تحديث الحالة');
    else {
      toast.success('تم تحديث الحالة بنجاح');
      fetchCategories();
    }
  };

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-900">إدارة الأقسام</h1>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <form onSubmit={addCategory} className="flex gap-4">
          <input 
            type="text"
            placeholder="اسم القسم الجديد..."
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500"
          />
          <button 
            type="submit"
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all"
          >
            إضافة
          </button>
        </form>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
            <tr>
              <th className="px-6 py-4">اسم القسم</th>
              <th className="px-6 py-4">الحالة</th>
              <th className="px-6 py-4">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900">{cat.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${cat.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {cat.is_active ? 'نشط' : 'غير نشط'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleStatus(cat)}
                      className={`p-2 rounded-lg transition-colors ${cat.is_active ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                    >
                      {cat.is_active ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                    </button>
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
