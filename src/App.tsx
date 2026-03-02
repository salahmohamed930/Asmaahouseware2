import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { ShoppingCart, User, LogOut, Menu, X, Home, Package, LayoutDashboard, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import RashaAssistant from './components/RashaAssistant';
import { isSupabaseConfigured } from './types';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import ReceiptPage from './pages/ReceiptPage';
import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  const { user, signOut } = useAuth();
  const { items } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-md w-full text-center space-y-6">
          <div className="bg-amber-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-amber-600">
            <AlertTriangle size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-gray-900">مطلوب إعداد Supabase</h1>
            <p className="text-gray-500 text-sm">
              يرجى إضافة متغيرات البيئة الخاصة بـ Supabase في لوحة (Secrets) ليعمل الموقع بشكل صحيح.
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl text-right text-xs font-mono space-y-2">
            <p>VITE_SUPABASE_URL</p>
            <p>VITE_SUPABASE_ANON_KEY</p>
            <p>SUPABASE_SERVICE_ROLE_KEY</p>
          </div>
          <p className="text-xs text-gray-400">
            بعد إضافة المفاتيح، سيتم إعادة تشغيل الموقع تلقائياً.
          </p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      <Toaster position="top-center" />
      
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-gray-600"
              >
                {isMenuOpen ? <X /> : <Menu />}
              </button>
              <Link to="/" className="text-2xl font-bold text-emerald-600">أسماء</Link>
            </div>

            <div className="hidden lg:flex items-center gap-8">
              <Link to="/" className="text-gray-600 hover:text-emerald-600 font-medium">الرئيسية</Link>
              <Link to="/products" className="text-gray-600 hover:text-emerald-600 font-medium">المنتجات</Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="text-emerald-600 font-bold flex items-center gap-1">
                  <LayoutDashboard size={18} />
                  لوحة التحكم
                </Link>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-emerald-600">
                <ShoppingCart size={24} />
                {items.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {items.length}
                  </span>
                )}
              </Link>
              
              {user ? (
                <div className="flex items-center gap-2">
                  <Link to="/orders" className="hidden sm:flex items-center gap-1 text-sm text-gray-600 hover:text-emerald-600">
                    <Package size={18} />
                    طلباتي
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="p-2 text-gray-600 hover:text-red-600"
                    title="تسجيل الخروج"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                  دخول
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 p-4 space-y-4">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block text-gray-600 font-medium">الرئيسية</Link>
            <Link to="/products" onClick={() => setIsMenuOpen(false)} className="block text-gray-600 font-medium">المنتجات</Link>
            {user?.role === 'admin' && (
              <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block text-emerald-600 font-bold">لوحة التحكم</Link>
            )}
            {user && (
              <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="block text-gray-600 font-medium">طلباتي</Link>
            )}
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrderTrackingPage />} />
          <Route path="/receipt/:id" element={<ReceiptPage />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Routes>
      </main>

      <RashaAssistant />
    </div>
  );
}
