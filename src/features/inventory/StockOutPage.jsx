import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PackageMinus } from 'lucide-react';
import { stockOut } from '../../api/inventory.api';
import { getProducts } from '../../api/product.api';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function StockOutPage() {
  const [sp] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ productId: sp.get('productId') || '', quantity: '', referenceNo: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    getProducts({ limit: 200 }).then(r => setProducts(r.data.data.products)).catch(() => {});
  }, []);

  const selectedProduct = products.find(p => p._id === form.productId);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const newQty = selectedProduct ? selectedProduct.quantity - Number(form.quantity) : 0;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await stockOut({ ...form, quantity: Number(form.quantity) });
      setResult(res.data.data);
      setForm({ productId: '', quantity: '', referenceNo: '', notes: '' });
      setConfirm(false);
      toast.success('Stock-out recorded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record stock-out');
      setConfirm(false);
    } finally { setSubmitting(false); }
  };

  const canSubmit = form.productId && form.quantity && Number(form.quantity) > 0 && selectedProduct && Number(form.quantity) <= selectedProduct.quantity;

  return (
    <div className="max-w-xl animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <PackageMinus className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Stock Out</h1>
          <p className="text-sm text-slate-500">Record a stock issue or dispatch</p>
        </div>
      </div>

      {result && (
        <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl animate-fade-in">
          <p className="text-sm font-semibold text-amber-800">✓ Stock-out recorded successfully</p>
          <p className="text-sm text-amber-700 mt-1">
            <strong>{result.product?.name}</strong>: {result.movement?.previousQuantity} → <strong>{result.movement?.newQuantity}</strong> {result.product?.unit}
          </p>
          <button onClick={() => setResult(null)} className="mt-2 text-xs text-amber-700 underline">Record another</button>
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
          <div className={`p-3 rounded-lg border text-sm ${selectedProduct.quantity === 0 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
            Available: <strong>{selectedProduct.quantity} {selectedProduct.unit}</strong>
            {selectedProduct.quantity === 0 && ' — Cannot issue from an out-of-stock product'}
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Quantity to Issue *</label>
          <input type="number" min="0.001" step="any" value={form.quantity} onChange={set('quantity')} required
            className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${selectedProduct && Number(form.quantity) > selectedProduct.quantity ? 'border-red-400 bg-red-50' : 'border-slate-200'}`} />
          {selectedProduct && form.quantity && Number(form.quantity) > selectedProduct.quantity && (
            <p className="text-xs text-red-600 mt-1">Quantity exceeds available stock ({selectedProduct.quantity} {selectedProduct.unit}).</p>
          )}
          {selectedProduct && form.quantity && Number(form.quantity) <= selectedProduct.quantity && (
            <p className="text-xs text-slate-500 mt-1">After issuing: {newQty} {selectedProduct.unit}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Reference / Purpose</label>
          <input type="text" value={form.referenceNo} onChange={set('referenceNo')} placeholder="SO-2024-001 / Maintenance"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Notes</label>
          <textarea value={form.notes} onChange={set('notes')} rows={2} placeholder="Optional notes…"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
        </div>

        <button onClick={() => { if (!canSubmit) return toast.error('Please fill all required fields correctly'); setConfirm(true); }}
          className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
          <PackageMinus className="w-4 h-4" /> Record Stock Out
        </button>
      </div>

      <ConfirmDialog isOpen={confirm} onClose={() => setConfirm(false)} onConfirm={handleSubmit}
        loading={submitting} title="Confirm Stock Out"
        message={`Issue ${form.quantity} units of "${selectedProduct?.name}"? Remaining: ${newQty} ${selectedProduct?.unit}`}
        confirmText="Record Stock Out" confirmVariant="warning" />
    </div>
  );
}
