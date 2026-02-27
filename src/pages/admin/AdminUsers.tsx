import { useEffect, useState } from 'react';
import { supabase, User } from '../../types';
import { User as UserIcon, Shield, ShieldAlert, CheckCircle2, XCircle, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  }

  const updateRole = async (userId: string, role: string) => {
    const { error } = await supabase.from('users').update({ role }).eq('id', userId);
    if (error) toast.error('فشل تحديث الرتبة');
    else {
      toast.success('تم تحديث الرتبة بنجاح');
      fetchUsers();
    }
  };

  const toggleStatus = async (user: User) => {
    const { error } = await supabase.from('users').update({ is_active: !user.is_active }).eq('id', user.id);
    if (error) toast.error('فشل تحديث الحالة');
    else {
      toast.success('تم تحديث الحالة بنجاح');
      fetchUsers();
    }
  };

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-900">إدارة المستخدمين</h1>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="ابحث بالاسم، البريد أو الهاتف..."
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
                <th className="px-6 py-4">المستخدم</th>
                <th className="px-6 py-4">الرتبة</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <UserIcon size={20} />
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-bold text-gray-900 text-sm">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.email || u.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={u.role}
                      onChange={(e) => updateRole(u.id, e.target.value)}
                      className={`text-xs font-bold px-3 py-1 rounded-full border-none focus:ring-2 focus:ring-emerald-500 ${
                        u.role === 'admin' ? 'bg-red-50 text-red-600' : 
                        u.role === 'wholesale' ? 'bg-purple-50 text-purple-600' : 
                        'bg-blue-50 text-blue-600'
                      }`}
                    >
                      <option value="customer">عميل</option>
                      <option value="wholesale">جملة</option>
                      <option value="admin">أدمن</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${u.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {u.is_active ? 'نشط' : 'محظور'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleStatus(u)}
                      className={`p-2 rounded-lg transition-colors ${u.is_active ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                    >
                      {u.is_active ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                    </button>
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
