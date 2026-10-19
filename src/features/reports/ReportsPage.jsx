import { useState, useEffect } from 'react';
import { BarChart2, Download, TrendingDown, DollarSign, PackageMinus, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import * as reportApi from '../../api/report.api';
import StatsCard from '../../components/StatsCard';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import Badge from '../../components/Badge';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [summary, setSummary] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [expiry, setExpiry] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, ls, ex, mv] = await Promise.all([
        reportApi.getValuation(),
        reportApi.getLowStockReport(),
        reportApi.getExpiryReport(),
        reportApi.getStockMovements({ limit: 30, groupBy: 'day' }),
      ]);
      setSummary(s.data.data);
      setLowStock(ls.data.data.products || []);
      setExpiry(ex.data.data.products || []);
      setMovements(mv.data.data.data || []);
    } catch { toast.error('Failed to load reports'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const fmtCurrency = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  const handleCSV = async (type, filename) => {
    try { await reportApi.downloadCSV(type, filename); }
    catch { toast.error('Export failed'); }
  };

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'lowstock', label: `Low Stock (${lowStock.length})` },
    { key: 'expiry', label: `Expiry (${expiry.length})` },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Inventory valuation, movement analysis, and alerts</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleCSV('valuation', 'inventory-valuation.csv')} className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
            <Download className="w-4 h-4" /> Valuation CSV
          </button>
          <button onClick={() => handleCSV('low-stock', 'low-stock.csv')} className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
            <Download className="w-4 h-4" /> Low Stock CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === t.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <CardSkeleton count={4} /> : (
        <>
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard label="Total Inventory Value" value={fmtCurrency(summary?.totalValue)} icon={<DollarSign className="w-5 h-5" />} color="green" />
                <StatsCard label="Total Products" value={summary?.totalProducts} icon={<BarChart2 className="w-5 h-5" />} color="indigo" />
                <StatsCard label="Low Stock Items" value={lowStock.length} icon={<TrendingDown className="w-5 h-5" />} color="amber" />
                <StatsCard label="Expiry Alerts" value={expiry.length} icon={<Clock className="w-5 h-5" />} color="red" />
              </div>

              {/* Movement chart */}
              {movements.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                  <h3 className="text-base font-semibold text-slate-800 mb-4">Stock Movements (Last 30 Days)</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={movements}>
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="stockIn" name="Stock In" stroke="#6366f1" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="stockOut" name="Stock Out" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Top products by value */}
              {summary?.topProducts?.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                  <h3 className="text-base font-semibold text-slate-800 mb-4">Top Products by Inventory Value</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={summary.topProducts} layout="vertical" margin={{ left: 20 }}>
                      <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                      <Tooltip formatter={v => [`₹${Number(v).toLocaleString('en-IN')}`, 'Value']} />
                      <Bar dataKey="value" fill="#6366f1" radius={[0,3,3,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {activeTab === 'lowstock' && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              {lowStock.length === 0 ? (
                <div className="py-12 text-center"><p className="text-2xl">✅</p><p className="text-slate-600 mt-2 font-medium">All products are above minimum threshold</p></div>
              ) : (
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-100 bg-slate-50">
                    {['Product', 'SKU', 'Category', 'Current Qty', 'Min Threshold', 'Deficit', 'Status'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {lowStock.map(p => (
                      <tr key={p._id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                        <td className="px-4 py-3"><code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{p.sku}</code></td>
                        <td className="px-4 py-3 text-slate-600">{p.category?.name}</td>
                        <td className={`px-4 py-3 font-bold ${p.quantity === 0 ? 'text-red-600' : 'text-amber-600'}`}>{p.quantity} {p.unit}</td>
                        <td className="px-4 py-3 text-slate-600">{p.minThreshold} {p.unit}</td>
                        <td className="px-4 py-3 text-red-600 font-medium">{Math.max(0, p.minThreshold - p.quantity)} needed</td>
                        <td className="px-4 py-3"><Badge color={p.quantity === 0 ? 'danger' : 'warning'}>{p.quantity === 0 ? 'Out of Stock' : 'Low Stock'}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'expiry' && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              {expiry.length === 0 ? (
                <div className="py-12 text-center"><p className="text-2xl">✅</p><p className="text-slate-600 mt-2 font-medium">No products at risk of expiry</p></div>
              ) : (
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-100 bg-slate-50">
                    {['Product', 'SKU', 'Batch', 'Expiry Date', 'Days Left', 'Qty', 'Status'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {expiry.map(p => {
                      const daysLeft = Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                      return (
                        <tr key={p._id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                          <td className="px-4 py-3"><code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{p.sku}</code></td>
                          <td className="px-4 py-3 text-slate-500 text-xs">{p.batchNumber || '—'}</td>
                          <td className="px-4 py-3 text-slate-700">{new Date(p.expiryDate).toLocaleDateString('en-IN')}</td>
                          <td className={`px-4 py-3 font-bold ${daysLeft < 0 ? 'text-red-600' : daysLeft <= 7 ? 'text-red-500' : 'text-amber-500'}`}>
                            {daysLeft < 0 ? `${Math.abs(daysLeft)}d ago` : `${daysLeft}d`}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{p.quantity} {p.unit}</td>
                          <td className="px-4 py-3"><Badge color={daysLeft < 0 ? 'danger' : 'warning'}>{daysLeft < 0 ? 'Expired' : 'Expiring Soon'}</Badge></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
