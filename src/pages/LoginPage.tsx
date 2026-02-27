import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../types';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
import { Mail, Lock, Phone, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState(''); // Email or Phone
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Since Supabase Auth usually uses Email, we might need a workaround for Phone login without OTP
      // or just assume the user provides email for now as per Supabase standard, 
      // but the requirement says email OR phone + password.
      // In a real scenario, we'd have a custom edge function to handle this.
      
      let email = identifier;
      if (!identifier.includes('@')) {
        // Try to find user by phone first
        const { data: userProfile } = await supabase
          .from('users')
          .select('email')
          .eq('phone', identifier)
          .single();
        
        if (userProfile?.email) {
          email = userProfile.email;
        } else {
          throw new Error('رقم الهاتف غير مسجل');
        }
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-gray-900">مرحباً بك مجدداً</h1>
          <p className="text-gray-500">سجل دخولك لمتابعة التسوق</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block">البريد الإلكتروني أو رقم الهاتف</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-emerald-500 transition-all"
                placeholder="example@mail.com أو 0123456789"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-emerald-500 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50"
          >
            {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="text-center space-y-4">
          <p className="text-gray-500 text-sm">
            ليس لديك حساب؟{' '}
            <Link to="/register" className="text-emerald-600 font-bold hover:underline">إنشاء حساب جديد</Link>
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
