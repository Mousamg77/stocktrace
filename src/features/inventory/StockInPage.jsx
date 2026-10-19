import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { PackagePlus, Search } from 'lucide-react';
import { stockIn } from '../../api/inventory.api';
import { getProducts } from '../../api/product.api';
import { getSuppliers } from '../../api/supplier.api';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function StockInPage() {
  const [sp] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ productId: sp.get('productId') || '', quantity: '', supplier: '', referenceNo: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    getProducts({ limit: 200 }).then(r => setProducts(r.data.data.products)).catch(() => {});
    getSuppliers().then(r => setSuppliers(r.data.data.suppliers)).catch(() => {});
  }, []);

  const selectedProduct = products.find(p => p._id === form.productId);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await stockIn({ ...form, quantity: Number(form.quantity), supplier: form.supplier || undefined });
      setResult(res.data.data);
      setForm({ productId: '', quantity: '', supplier: '', referenceNo: '', notes: '' });
      setConfirm(false);
      toast.success('Stock-in recorded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record stock-in');
      setConfirm(false);
    } finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-xl animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
          <PackagePlus className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Stock In</h1>
          <p className="text-sm text-slate-500">Record a stock receipt</p>
        </div>
      </div>

      {result && (
        <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl animate-fade-in">
          <p className="text-sm font-semibold text-green-800">✓ Stock-in recorded successfully</p>
          <p className="text-sm text-green-700 mt-1">
            <strong>{result.product?.name}</strong>: {result.movement?.previousQuantity} → <strong>{result.movement?.newQuantity}</strong> {result.product?.unit}
          </p>
          <button onClick={() => setResult(null)} className="mt-2 text-xs text-green-700 underline">Record another</button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Product *</label>
          <select value={form.productId} onChange={set('productId')} required
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
            <option value="">Select a product…</option>
            {products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.sku}) — {p.quantity} {p.unit}</option>)}
          </select>
        </div>

        {selectedProduct && (
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
            <div className="text-sm">
              <span className="font-medium text-slate-700">Current stock: </span>
              <span className="font-bold text-green-700">{selectedProduct.quantity} {selectedProduct.unit}</span>
              <span className="text-slate-400"> · Min: {selectedProduct.minThreshold}</span>
            </div>
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Quantity Received *</label>
          <input type="number" min="0.001" step="any" value={form.quantity} onChange={set('quantity')} required placeholder="e.g. 50"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Supplier</label>
          <select value={form.supplier} onChange={set('supplier')}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
            <option value="">None</option>
            {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Reference / PO Number</label>
          <input type="text" value={form.referenceNo} onChange={set('referenceNo')} placeholder="PO-2024-001"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Notes</label>
          <textarea value={form.notes} onChange={set('notes')} rows={2} placeholder="Optional notes…"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
        </div>

        <button onClick={() => { if (!form.productId || !form.quantity) return toast.error('Select a product and quantity'); setConfirm(true); }}
          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
          <PackagePlus className="w-4 h-4" /> Record Stock In
        </button>
      </div>

      <ConfirmDialog isOpen={confirm} onClose={() => setConfirm(false)} onConfirm={handleSubmit}
        loading={submitting} title="Confirm Stock In"
        message={`Add ${form.quantity} units to "${selectedProduct?.name}"? New quantity: ${selectedProduct ? Number(selectedProduct.quantity) + Number(form.quantity) : '?'} ${selectedProduct?.unit}`}
        confirmText="Record Stock In" confirmVariant="success" />
    </div>
  );
}
