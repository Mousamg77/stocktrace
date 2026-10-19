import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { getAlerts, resolveAlert } from '../../api/alert.api';
import Badge from '../../components/Badge';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/AuthContext';
import toast from 'react-hot-toast';

const typeConfig = {
  LOW_STOCK: { label: 'Low Stock', color: 'warning', icon: '📉' },
  OUT_OF_STOCK: { label: 'Out of Stock', color: 'danger', icon: '🚫' },
  EXPIRY_SOON: { label: 'Expiring Soon', color: 'warning', icon: '⏰' },
  EXPIRED: { label: 'Expired', color: 'danger', icon: '❌' },
};

export default function AlertsPage() {
  const { canManage } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: 'active', type: '', page: 1, limit: 20 });
  const [resolving, setResolving] = useState(null);

  const fetchAlerts = async (f = filter) => {
    setLoading(true);
    try {
      const params = { ...f };
      if (!params.type) delete params.type;
      const res = await getAlerts(params);
      setAlerts(res.data.data.alerts);
      setPagination(res.data.data.pagination);
    } catch { toast.error('Failed to load alerts'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAlerts(filter); }, [filter]);

  const handleResolve = async (id) => {
    setResolving(id);
    try {
      await resolveAlert(id);
      toast.success('Alert resolved');
      fetchAlerts(filter);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to resolve'); }
    finally { setResolving(null); }
  };

  const setF = (k, v) => setFilter(f => ({ ...f, [k]: v, page: 1 }));

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Alerts</h1>
          <p className="text-sm text-slate-500 mt-0.5">{pagination?.total ?? 0} {filter.status} alerts</p>
        </div>
        <button onClick={() => fetchAlerts(filter)} className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['active', 'resolved'].map(s => (
          <button key={s} onClick={() => setF('status', s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filter.status === s ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {s}
          </button>
        ))}
        <div className="ml-auto">
          <select value={filter.type} onChange={e => setF('type', e.target.value)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
            <option value="">All Types</option>
            {Object.entries(typeConfig).map(([k, { label }]) => <option key={k} value={k}>{label}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">{Array.from({length:5}).map((_,i)=><div key={i} className="skeleton h-14 rounded-xl" />)}</div>
        ) : alerts.length === 0 ? (
          <EmptyState title={`No ${filter.status} alerts`} description={filter.status === 'active' ? 'Great! Everything looks good.' : 'No resolved alerts to show.'} icon={<CheckCircle className="w-8 h-8 text-green-400" />} />
        ) : (
          <>
            <div className="divide-y divide-slate-50">
              {alerts.map(a => {
                const cfg = typeConfig[a.type] || { label: a.type, color: 'slate', icon: '⚠️' };
                return (
                  <div key={a._id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                    <span className="text-xl">{cfg.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge color={cfg.color}>{cfg.label}</Badge>
                        {a.resolvedBy && <span className="text-xs text-slate-400">resolved by {a.resolvedBy.name}</span>}
                      </div>
                      <p className="text-sm font-medium text-slate-700 mt-0.5">{a.message}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <Link to={`/products/${a.product?._id}`} className="text-xs text-indigo-600 hover:underline">{a.product?.name} ({a.product?.sku})</Link>
                        <span className="text-xs text-slate-400">{new Date(a.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                    {a.status === 'active' && canManage && (
                      <button onClick={() => handleResolve(a._id)} disabled={resolving === a._id}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-green-200 text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-60">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {resolving === a._id ? '…' : 'Resolve'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="px-4 pb-4">
              <Pagination pagination={pagination} onPageChange={p => setFilter(f => ({...f, page: p}))} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
