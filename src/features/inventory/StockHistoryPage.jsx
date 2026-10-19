import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { History, Download, RefreshCw } from 'lucide-react';
import { getHistory } from '../../api/inventory.api';
import Badge from '../../components/Badge';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { getProducts } from '../../api/product.api';
import toast from 'react-hot-toast';

const typeBadge = (t) => {
  if (t === 'STOCK_IN') return <Badge color="success">Stock In</Badge>;
  if (t === 'STOCK_OUT') return <Badge color="warning">Stock Out</Badge>;
  return <Badge color="primary">Adjustment</Badge>;
};

export default function StockHistoryPage() {
  const [sp] = useSearchParams();
  const [movements, setMovements] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    productId: sp.get('productId') || '',
    type: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20,
  });

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filter };
      if (!params.productId) delete params.productId;
      if (!params.type) delete params.type;
      if (!params.startDate) delete params.startDate;
      if (!params.endDate) delete params.endDate;
      const res = await getHistory(params);
      setMovements(res.data.data.movements);
      setPagination(res.data.data.pagination);
    } catch { toast.error('Failed to load history'); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);
  useEffect(() => {
    getProducts({ limit: 200 }).then(r => setProducts(r.data.data.products)).catch(() => {});
  }, []);

  const handleExportCSV = () => {
    const params = new URLSearchParams({ ...filter, format: 'csv' });
    Object.keys(filter).forEach(k => !filter[k] && params.delete(k));
    window.open(`${import.meta.env.VITE_API_URL || '/api/v1'}/reports/stock-movements?${params}`, '_blank');
  };

  const set = k => e => setFilter(f => ({ ...f, [k]: e.target.value, page: 1 }));

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Stock History</h1>
          <p className="text-sm text-slate-500 mt-0.5">Audit trail of all inventory movements</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={fetchHistory} className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-wrap gap-3">
        <select value={filter.productId} onChange={set('productId')} className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white flex-1 min-w-40">
          <option value="">All Products</option>
          {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        <select value={filter.type} onChange={set('type')} className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
          <option value="">All Types</option>
          <option value="STOCK_IN">Stock In</option>
          <option value="STOCK_OUT">Stock Out</option>
          <option value="ADJUSTMENT">Adjustment</option>
        </select>
        <input type="date" value={filter.startDate} onChange={set('startDate')} className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <input type="date" value={filter.endDate} onChange={set('endDate')} className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-5"><LoadingSkeleton rows={8} cols={6} /></div>
        ) : movements.length === 0 ? (
          <EmptyState title="No movements found" description="Try adjusting your filters." icon={<History className="w-8 h-8 text-slate-400" />} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {['Date & Time', 'Product', 'Type', 'Qty', 'Before → After', 'By', 'Reference', 'Notes'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {movements.map(m => (
                    <tr key={m._id} className={`hover:bg-slate-50 transition-colors ${m.isReversed ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(m.createdAt).toLocaleDateString('en-IN')}<br />
                        <span className="text-slate-400">{new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{m.product?.name}</p>
                        <p className="text-xs text-slate-400">{m.product?.sku}</p>
                      </td>
                      <td className="px-4 py-3">{typeBadge(m.type)}{m.isReversed && <span className="ml-1 text-xs text-slate-400">reversed</span>}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{m.quantity} {m.product?.unit}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{m.previousQuantity} → {m.newQuantity}</td>
                      <td className="px-4 py-3 text-slate-600">{m.performedBy?.name}</td>
                      <td className="px-4 py-3"><code className="text-xs text-slate-500">{m.referenceNo || '—'}</code></td>
                      <td className="px-4 py-3 text-xs text-slate-500 max-w-32 truncate">{m.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 pb-4">
              <Pagination pagination={pagination} onPageChange={p => setFilter(f => ({ ...f, page: p }))} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
