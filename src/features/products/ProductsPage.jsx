import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Package, Plus, Search, Filter, Download, Archive, Eye, Edit3 } from 'lucide-react';
import * as productApi from '../../api/product.api';
import { useDebounce } from '../../hooks/useDebounce';
import { getCategories } from '../../api/category.api';
import Badge from '../../components/Badge';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useAuth } from '../../hooks/AuthContext';
import toast from 'react-hot-toast';

const stockBadge = (s) => {
  if (s === 'out_of_stock') return <Badge color="danger">Out of Stock</Badge>;
  if (s === 'low_stock') return <Badge color="warning">Low Stock</Badge>;
  return <Badge color="success">In Stock</Badge>;
};

const expiryBadge = (s) => {
  if (s === 'expired') return <Badge color="danger">Expired</Badge>;
  if (s === 'expiring_soon') return <Badge color="warning">Expiring Soon</Badge>;
  return null;
};

export default function ProductsPage() {
  const { canManage } = useAuth();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState({ page: 1, limit: 15, sortBy: 'createdAt', sortOrder: 'desc', search: searchParams.get('search') || '', category: '', stockStatus: '' });
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [archiving, setArchiving] = useState(false);

  const debouncedSearch = useDebounce(query.search, 350);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...query, search: debouncedSearch };
      const res = await productApi.getProducts(params);
      setProducts(res.data.data.products);
      setPagination(res.data.data.pagination);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  }, [debouncedSearch, query.page, query.category, query.stockStatus, query.sortBy, query.sortOrder]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { getCategories().then(r => setCategories(r.data.data.categories)).catch(() => {}); }, []);

  const handleArchive = async () => {
    setArchiving(true);
    try {
      await productApi.archiveProduct(archiveTarget._id);
      toast.success('Product archived');
      setArchiveTarget(null);
      fetchProducts();
    } catch (err) { toast.error(err.response?.data?.message || 'Archive failed'); }
    finally { setArchiving(false); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Products</h1>
          <p className="text-sm text-slate-500 mt-0.5">{pagination?.total ?? 0} products</p>
        </div>
        {canManage && (
          <Link to="/products/new" className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={query.search} onChange={e => setQuery({...query, search: e.target.value, page: 1})}
            placeholder="Search by name, SKU…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <select value={query.category} onChange={e => setQuery({...query, category: e.target.value, page: 1})}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select value={query.stockStatus} onChange={e => setQuery({...query, stockStatus: e.target.value, page: 1})}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
          <option value="">All Stock Status</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
        <select value={query.sortBy} onChange={e => setQuery({...query, sortBy: e.target.value})}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
          <option value="createdAt">Newest first</option>
          <option value="name">Name A–Z</option>
          <option value="quantity">Quantity</option>
          <option value="costPrice">Cost price</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-5"><LoadingSkeleton rows={8} cols={6} /></div>
        ) : products.length === 0 ? (
          <EmptyState title="No products found" description="Try adjusting your search or filters, or add a new product." icon={<Package className="w-8 h-8 text-slate-400" />} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {['Product', 'SKU', 'Category', 'Qty / Min', 'Cost Price', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {products.map(p => (
                    <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{p.name}</p>
                        {p.brand && <p className="text-xs text-slate-400">{p.brand}</p>}
                      </td>
                      <td className="px-4 py-3"><code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{p.sku}</code></td>
                      <td className="px-4 py-3 text-slate-600">{p.category?.name ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${p.quantity === 0 ? 'text-red-600' : p.quantity <= p.minThreshold ? 'text-amber-600' : 'text-slate-800'}`}>
                          {p.quantity}
                        </span>
                        <span className="text-slate-400"> / {p.minThreshold} {p.unit}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">₹{p.costPrice?.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          {stockBadge(p.stockStatus)}
                          {expiryBadge(p.expiryStatus)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link to={`/products/${p._id}`} className="p-1.5 rounded hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors" title="View">
                            <Eye className="w-4 h-4" />
                          </Link>
                          {canManage && (
                            <>
                              <Link to={`/products/${p._id}/edit`} className="p-1.5 rounded hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors" title="Edit">
                                <Edit3 className="w-4 h-4" />
                              </Link>
                              <button onClick={() => setArchiveTarget(p)} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors" title="Archive">
                                <Archive className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 pb-4">
              <Pagination pagination={pagination} onPageChange={p => setQuery({...query, page: p})} />
            </div>
          </>
        )}
      </div>

      <ConfirmDialog isOpen={!!archiveTarget} onClose={() => setArchiveTarget(null)} onConfirm={handleArchive}
        loading={archiving} title="Archive Product"
        message={`Archive "${archiveTarget?.name}"? It will no longer appear in active inventory.`}
        confirmText="Archive" />
    </div>
  );
}
