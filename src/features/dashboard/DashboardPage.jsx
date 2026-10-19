import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, AlertTriangle, TrendingDown, DollarSign, Activity, PackagePlus, PackageMinus, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import StatsCard from '../../components/StatsCard';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import Badge from '../../components/Badge';
import * as dashApi from '../../api/dashboard.api';
import toast from 'react-hot-toast';

const PIE_COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899'];

const fmtCurrency = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

export default function DashboardPage() {
  const [kpis, setKpis] = useState(null);
  const [chart, setChart] = useState([]);
  const [catDist, setCatDist] = useState([]);
  const [recentMoves, setRecentMoves] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [k, c, cat, rm, rp] = await Promise.all([
        dashApi.getDashboardKPIs(),
        dashApi.getStockChart(30),
        dashApi.getCategoryDistribution(),
        dashApi.getRecentMovements(),
        dashApi.getRecentProducts(),
      ]);
      setKpis(k.data.data.kpis);
      setChart(c.data.data.data);
      setCatDist(cat.data.data.data);
      setRecentMoves(rm.data.data.data);
      setRecentProducts(rp.data.data.data);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Real-time inventory overview</p>
        </div>
        <button onClick={fetchAll} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      {loading ? <CardSkeleton count={6} /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatsCard label="Total Products" value={kpis?.totalProducts} icon={<Package className="w-5 h-5" />} color="indigo" />
          <StatsCard label="Total Units" value={kpis?.totalUnits?.toLocaleString()} icon={<Activity className="w-5 h-5" />} color="purple" />
          <StatsCard label="Inventory Value" value={fmtCurrency(kpis?.inventoryValue)} icon={<DollarSign className="w-5 h-5" />} color="green" />
          <StatsCard label="Low Stock" value={kpis?.lowStock} icon={<TrendingDown className="w-5 h-5" />} color="amber" subtitle="Below threshold" />
          <StatsCard label="Out of Stock" value={kpis?.outOfStock} icon={<AlertTriangle className="w-5 h-5" />} color="red" />
          <StatsCard label="Expiring Soon" value={kpis?.expiringProducts} icon={<AlertTriangle className="w-5 h-5" />} color="amber" subtitle="Within 30 days" />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Stock Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Stock In vs Stock Out (Last 30 Days)</h2>
          {chart.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No movement data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chart} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={fmtDate} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v, name) => [v, name === 'stockIn' ? 'Stock In' : 'Stock Out']} labelFormatter={fmtDate} />
                <Bar dataKey="stockIn" name="Stock In" fill="#6366f1" radius={[3,3,0,0]} />
                <Bar dataKey="stockOut" name="Stock Out" fill="#f59e0b" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Pie */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Category Distribution</h2>
          {catDist.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No categories yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={catDist} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} paddingAngle={2}>
                  {catDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v, name) => [`${v} products`, name]} />
                <Legend formatter={(v) => <span className="text-xs text-slate-600">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Movements */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-800">Recent Transactions</h2>
            <Link to="/history" className="text-xs text-indigo-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentMoves.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No movements yet</p>
            ) : recentMoves.map((m) => (
              <div key={m._id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${m.type === 'STOCK_IN' ? 'bg-green-100' : 'bg-amber-100'}`}>
                  {m.type === 'STOCK_IN' ? <PackagePlus className="w-4 h-4 text-green-600" /> : <PackageMinus className="w-4 h-4 text-amber-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{m.product?.name}</p>
                  <p className="text-xs text-slate-400">{m.performedBy?.name} · {fmtDate(m.createdAt)}</p>
                </div>
                <Badge color={m.type === 'STOCK_IN' ? 'success' : 'warning'}>
                  {m.type === 'STOCK_IN' ? '+' : '-'}{m.quantity} {m.product?.unit}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-800">Recently Added Products</h2>
            <Link to="/products" className="text-xs text-indigo-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentProducts.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No products yet</p>
            ) : recentProducts.map((p) => (
              <Link key={p._id} to={`/products/${p._id}`} className="flex items-center gap-3 hover:bg-slate-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{p.name}</p>
                  <p className="text-xs text-slate-400">{p.sku} · {p.category?.name}</p>
                </div>
                <Badge color={p.quantity === 0 ? 'danger' : p.quantity <= p.minThreshold ? 'warning' : 'success'}>
                  {p.quantity} {p.unit}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
