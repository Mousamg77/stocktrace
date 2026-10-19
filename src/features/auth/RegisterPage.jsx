import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/AuthContext';
import { QrCode, User, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { registerUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await registerUser({ name: form.name, email: form.email, password: form.password });
      toast.success('Account created! Welcome to StockTrace.');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = (key, label, type = 'text', placeholder, Icon) => (
    <div>
      <label className="text-sm font-medium text-slate-700 block mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type={type} value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} required
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Create your account</h2>
          <p className="mt-2 text-sm text-slate-500">New accounts are created as Staff by default</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            {field('name', 'Full Name', 'text', 'Alice Admin', User)}
            {field('email', 'Email address', 'email', 'alice@stocktrace.dev', Mail)}
            {field('password', 'Password', 'password', '••••••••', Lock)}
            {field('confirmPassword', 'Confirm Password', 'password', '••••••••', Lock)}
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
