import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/AuthContext';
import { QrCode, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">StockTrace</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white leading-tight">
            Smart Inventory<br />Management with QR
          </h1>
          <p className="mt-4 text-indigo-200 text-lg">
            Track every item, every movement, every moment — with precision.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[['12+', 'Products tracked'], ['Real-time', 'Stock updates'], ['Secure', 'Role-based access']].map(([val, lbl]) => (
              <div key={lbl} className="bg-white/10 rounded-xl p-4">
                <p className="text-xl font-bold text-white">{val}</p>
                <p className="text-xs text-indigo-200 mt-1">{lbl}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-indigo-300 text-sm">© 2024 StockTrace. Built with MERN Stack.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-4 lg:hidden">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Sign in to StockTrace</h2>
            <br></br>
            <p className="mt-2 text-sm text-slate-500">Enter your credentials to continue</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            {error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Email address</label>
                <br></br>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required
                    placeholder="admin@stocktrace.dev"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => setForm({...form, password: e.target.value})} required
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {loading && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-xs text-slate-500 font-medium mb-3 text-center">Demo accounts</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { role: 'Admin', email: 'admin@stocktrace.dev', pw: 'Admin@123' },
                  { role: 'Manager', email: 'manager@stocktrace.dev', pw: 'Manager@123' },
                  { role: 'Staff', email: 'staff@stocktrace.dev', pw: 'Staff@123' },
                ].map(({ role, email, pw }) => (
                  <button key={role} type="button"
                    onClick={() => setForm({ email, password: pw })}
                    className="text-xs p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-100 transition-colors text-slate-600 font-medium">
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Need an account?{' '}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
