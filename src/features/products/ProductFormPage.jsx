import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import * as productApi from '../../api/product.api';
import { getCategories } from '../../api/category.api';
import { getSuppliers } from '../../api/supplier.api';
import toast from 'react-hot-toast';

const Field = ({ label, error, children }) => (
  <div>
    <label className="text-sm font-medium text-slate-700 block mb-1.5">{label}</label>
    {children}
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
);

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: '', sku: '', description: '', category: '', brand: '', unit: 'pcs',
    quantity: 0, minThreshold: 5, costPrice: '', sellingPrice: '',
    supplier: '', location: '', batchNumber: '', mfgDate: '', expiryDate: '',
  });

  useEffect(() => {
    Promise.all([getCategories(), getSuppliers()]).then(([c, s]) => {
      setCategories(c.data.data.categories);
      setSuppliers(s.data.data.suppliers);
    });
    if (isEdit) {
      setLoading(true);
      productApi.getProduct(id).then(r => {
        const p = r.data.data.product;
        setForm({
          name: p.name, sku: p.sku, description: p.description || '', category: p.category?._id || '',
          brand: p.brand || '', unit: p.unit, minThreshold: p.minThreshold, costPrice: p.costPrice,
          sellingPrice: p.sellingPrice || '', supplier: p.supplier?._id || '', location: p.location || '',
          batchNumber: p.batchNumber || '',
          mfgDate: p.mfgDate ? p.mfgDate.substring(0, 10) : '',
          expiryDate: p.expiryDate ? p.expiryDate.substring(0, 10) : '',
          quantity: p.quantity,
        });
      }).catch(() => { toast.error('Product not found'); navigate('/products'); })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Product name is required';
    if (!form.sku.trim()) e.sku = 'SKU is required';
    if (!form.category) e.category = 'Category is required';
    if (!form.unit.trim()) e.unit = 'Unit is required';
    if (form.costPrice === '' || isNaN(form.costPrice) || Number(form.costPrice) < 0) e.costPrice = 'Valid cost price required';
    if (form.minThreshold < 0) e.minThreshold = 'Must be >= 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const data = { ...form, costPrice: Number(form.costPrice), minThreshold: Number(form.minThreshold), quantity: Number(form.quantity || 0), sellingPrice: form.sellingPrice ? Number(form.sellingPrice) : undefined, mfgDate: form.mfgDate || undefined, expiryDate: form.expiryDate || undefined, supplier: form.supplier || undefined };
    try {
      if (isEdit) { await productApi.updateProduct(id, data); toast.success('Product updated!'); navigate(`/products/${id}`); }
      else { const r = await productApi.createProduct(data); toast.success('Product created!'); navigate(`/products/${r.data.data.product._id}`); }
    } catch (err) {
      const msg = err.response?.data?.message || 'Save failed';
      toast.error(msg);
      if (err.response?.data?.errors) {
        const e = {}; err.response.data.errors.forEach(({ field, message }) => { e[field] = message; }); setErrors(e);
      }
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;

  const inp = (key, type = 'text', placeholder = '') => (
    <input type={type} value={form[key]} onChange={set(key)} placeholder={placeholder}
      className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors[key] ? 'border-red-400 bg-red-50' : 'border-slate-200'}`} />
  );

  return (
    <div className="max-w-3xl animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 text-slate-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">{isEdit ? 'Edit Product' : 'New Product'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Basic Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Product Name *" error={errors.name}>{inp('name', 'text', 'USB-C Charging Cable')}</Field>
            <Field label="SKU *" error={errors.sku}>{inp('sku', 'text', 'ELEC-001')}</Field>
            <Field label="Category *" error={errors.category}>
              <select value={form.category} onChange={set('category')} className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white ${errors.category ? 'border-red-400' : 'border-slate-200'}`}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Brand">{inp('brand', 'text', 'Anker')}</Field>
            <Field label="Unit of Measurement *" error={errors.unit}>{inp('unit', 'text', 'pcs / kg / litres')}</Field>
            <Field label="Storage Location">{inp('location', 'text', 'Rack A-1')}</Field>
          </div>
          <Field label="Description">
            <textarea value={form.description} onChange={set('description')} rows={2} placeholder="Brief product description…"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </Field>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Pricing & Stock</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {!isEdit && <Field label="Initial Quantity">{inp('quantity', 'number', '0')}</Field>}
            <Field label="Min Stock Threshold *" error={errors.minThreshold}>{inp('minThreshold', 'number', '5')}</Field>
            <Field label="Cost Price (₹) *" error={errors.costPrice}>{inp('costPrice', 'number', '249')}</Field>
            <Field label="Selling Price (₹)">{inp('sellingPrice', 'number', '399')}</Field>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Supplier & Batch</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Supplier">
              <select value={form.supplier} onChange={set('supplier')} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                <option value="">None</option>
                {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Batch / Lot Number">{inp('batchNumber', 'text', 'BA2024-01')}</Field>
            <Field label="Manufacturing Date">{inp('mfgDate', 'date')}</Field>
            <Field label="Expiry Date">{inp('expiryDate', 'date')}</Field>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="px-5 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60">
            {saving ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
