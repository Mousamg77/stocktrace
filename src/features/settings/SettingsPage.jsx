import { useState } from 'react';
import { User, Lock, Save } from 'lucide-react';
import { useAuth } from '../../hooks/AuthContext';
import { updateProfile, changePassword } from '../../api/auth.api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, fetchUser } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) return toast.error('Name is required');
    setSavingProfile(true);
    try {
      await updateProfile({ name: profile.name });
      await fetchUser();
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update profile'); }
    finally { setSavingProfile(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirmPassword) return toast.error('Passwords do not match');
    if (pw.newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    setSavingPw(true);
    try {
      await changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      setPw({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    finally { setSavingPw(false); }
  };

  const inp = (val, onChange, type = 'text', placeholder = '') => (
    <input type={type} value={val} onChange={onChange} placeholder={placeholder}
      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
  );

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-800">Settings</h1>

      {/* Profile */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
            <User className="w-4 h-4 text-indigo-600" />
          </div>
          <h2 className="text-base font-semibold text-slate-800">Profile Information</h2>
        </div>

        <div className="flex items-center gap-4 mb-5 p-4 bg-slate-50 rounded-xl">
          <div className="w-14 h-14 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xl font-bold">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-800">{user?.name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full capitalize font-medium ${user?.role === 'admin' ? 'bg-red-100 text-red-700' : user?.role === 'manager' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Full Name</label>
            {inp(profile.name, e => setProfile(p => ({...p, name: e.target.value})), 'text', 'Your name')}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Email Address</label>
            <input type="email" value={profile.email} disabled
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-400 cursor-not-allowed" />
            <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
          </div>
          <button type="submit" disabled={savingProfile}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60">
            <Save className="w-4 h-4" /> {savingProfile ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <Lock className="w-4 h-4 text-amber-600" />
          </div>
          <h2 className="text-base font-semibold text-slate-800">Change Password</h2>
        </div>
        <form onSubmit={handlePasswordSave} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Current Password</label>
            {inp(pw.currentPassword, e => setPw(p => ({...p, currentPassword: e.target.value})), 'password', '••••••••')}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">New Password</label>
            {inp(pw.newPassword, e => setPw(p => ({...p, newPassword: e.target.value})), 'password', '••••••••')}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Confirm New Password</label>
            {inp(pw.confirmPassword, e => setPw(p => ({...p, confirmPassword: e.target.value})), 'password', '••••••••')}
            {pw.confirmPassword && pw.newPassword !== pw.confirmPassword && (
              <p className="text-xs text-red-600 mt-1">Passwords don't match</p>
            )}
          </div>
          <button type="submit" disabled={savingPw}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60">
            <Lock className="w-4 h-4" /> {savingPw ? 'Changing…' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
