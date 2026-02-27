import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../types';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
import { User, Mail, Lock, Phone, MapPin, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    role: 'customer' as 'customer' | 'wholesale'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create Auth User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Create User Profile
        const { error: profileError } = await supabase.from('users').insert({
          id: authData.user.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          role: formData.role,
          password_hash: 'managed_by_supabase_auth'
        });

        if (profileError) throw profileError;
      }

      toast.success('تم إنشاء الحساب بنجاح! يرجى تسجيل الدخول.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'فشل إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 mb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-gray-900">إنشاء حساب جديد</h1>
          <p className="text-gray-500">انضم إلينا واستمتع بتجربة تسوق فريدة</p>
        </div>

        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-gray-700 block">الاسم الكامل</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-emerald-500 transition-all"
                placeholder="أدخل اسمك بالكامل"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block">البريد الإلكتروني</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-emerald-500 transition-all"
                placeholder="example@mail.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block">رقم الهاتف</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                <Phone size={18} />
              </div>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-emerald-500 transition-all"
                placeholder="0123456789"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block">كلمة المرور</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-emerald-500 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block">نوع الحساب</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value as any})}
              className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-emerald-500 transition-all font-bold"
            >
              <option value="customer">عميل عادي</option>
              <option value="wholesale">تاجر جملة</option>
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-gray-700 block">العنوان</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                <MapPin size={18} />
              </div>
              <textarea
                required
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-emerald-500 transition-all min-h-[100px]"
                placeholder="أدخل عنوانك بالتفصيل"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full md:col-span-2 bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50"
          >
            {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
          </button>
        </form>

        <div className="text-center space-y-4">
          <p className="text-gray-500 text-sm">
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="text-emerald-600 font-bold hover:underline">تسجيل الدخول</Link>
          </p>
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm transition-colors">
            <ArrowLeft size={16} />
            العودة للرئيسية
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
