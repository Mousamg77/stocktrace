import { useState, useEffect } from 'react';
import { Users, ShieldCheck, ToggleLeft, ToggleRight } from 'lucide-react';
import { getUsers, updateUserRole, toggleUserActive } from '../../api/user.api';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../hooks/AuthContext';
import toast from 'react-hot-toast';

const roleColors = { admin: 'danger', manager: 'primary', staff: 'slate' };

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try { const r = await getUsers(); setUsers(r.data.data.users); }
    catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (id, role) => {
    try { await updateUserRole(id, role); toast.success('Role updated'); fetchUsers(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleToggle = async (id, name, isActive) => {
    try { await toggleUserActive(id); toast.success(`${name} ${isActive ? 'deactivated' : 'activated'}`); fetchUsers(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage roles and access for all users (Admin only)</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">{Array.from({length:4}).map((_,i)=><div key={i} className="skeleton h-14 rounded-xl" />)}</div>
        ) : users.length === 0 ? (
          <EmptyState title="No users found" icon={<Users className="w-8 h-8 text-slate-400" />} />
        ) : (
          <div className="divide-y divide-slate-50">
            {users.map(u => (
              <div key={u._id} className={`flex items-center gap-4 px-5 py-4 ${!u.isActive ? 'opacity-60 bg-slate-50' : 'hover:bg-slate-50'} transition-colors`}>
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {u.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800">{u.name}</p>
                    {u._id === currentUser?._id && <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-medium">You</span>}
                  </div>
                  <p className="text-xs text-slate-400">{u.email}</p>
                </div>
                <Badge color={roleColors[u.role] || 'slate'}>
                  <ShieldCheck className="w-3 h-3" /> {u.role}
                </Badge>
                <Badge color={u.isActive ? 'success' : 'slate'}>{u.isActive ? 'Active' : 'Inactive'}</Badge>

                {u._id !== currentUser?._id && (
                  <div className="flex items-center gap-2">
                    <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)}
                      className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="staff">Staff</option>
                    </select>
                    <button onClick={() => handleToggle(u._id, u.name, u.isActive)}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors" title={u.isActive ? 'Deactivate' : 'Activate'}>
                      {u.isActive ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
