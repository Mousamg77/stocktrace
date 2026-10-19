import { useState, useEffect } from 'react';
import { Truck, Plus, Edit3 } from 'lucide-react';
import { getSuppliers, createSupplier, updateSupplier } from '../../api/supplier.api';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../hooks/AuthContext';
import toast from 'react-hot-toast';

export default function SuppliersPage() {
  const { canManage } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', contactPerson: '', email: '', phone: '', address: '', notes: '' });

  const fetch = async () => {
    setLoading(true);
    try { const r = await getSuppliers({ includeInactive: true }); setSuppliers(r.data.data.suppliers); }
    catch { toast.error('Failed to load suppliers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openModal = (s = null) => {
    setEditing(s);
    setForm(s ? { name: s.name, contactPerson: s.contactPerson || '', email: s.email || '', phone: s.phone || '', address: s.address || '', notes: s.notes || '' } : { name: '', contactPerson: '', email: '', phone: '', address: '', notes: '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Supplier name is required');
    setSaving(true);
    try {
      if (editing) { await updateSupplier(editing._id, form); toast.success('Supplier updated'); }
      else { await createSupplier(form); toast.success('Supplier created'); }
      setModalOpen(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleToggle = async (s) => {
    try { await updateSupplier(s._id, { isActive: !s.isActive }); toast.success('Updated'); fetch(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const inp = (k, placeholder, type = 'text') => (
    <input type={type} value={form[k]} onChange={e => setForm(f => ({...f, [k]: e.target.value}))} placeholder={placeholder}
      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Suppliers</h1>
          <p className="text-sm text-slate-500">{suppliers.length} suppliers</p>
        </div>
        {canManage && (
          <button onClick={() => openModal()} className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Add Supplier
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">{Array.from({length:4}).map((_,i)=><div key={i} className="skeleton h-16 rounded-xl" />)}</div>
        ) : suppliers.length === 0 ? (
          <EmptyState title="No suppliers yet" description="Add your first supplier." icon={<Truck className="w-8 h-8 text-slate-400" />} />
        ) : (
          <div className="divide-y divide-slate-50">
            {suppliers.map(s => (
              <div key={s._id} className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors ${!s.isActive ? 'opacity-60' : ''}`}>
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{s.name}</p>
                  <p className="text-xs text-slate-400">{[s.contactPerson, s.email, s.phone].filter(Boolean).join(' · ')}</p>
                  {s.address && <p className="text-xs text-slate-400 truncate">{s.address}</p>}
                </div>
                <Badge color={s.isActive ? 'success' : 'slate'}>{s.isActive ? 'Active' : 'Inactive'}</Badge>
                {canManage && (
                  <div className="flex gap-2">
                    <button onClick={() => openModal(s)} className="p-1.5 rounded hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleToggle(s)} className="text-xs px-2 py-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors">{s.isActive ? 'Disable' : 'Enable'}</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Supplier' : 'New Supplier'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="text-sm font-medium text-slate-700 block mb-1.5">Supplier Name *</label>{inp('name', 'TechVenture Pvt. Ltd.')}</div>
            <div><label className="text-sm font-medium text-slate-700 block mb-1.5">Contact Person</label>{inp('contactPerson', 'Raj Mehta')}</div>
            <div><label className="text-sm font-medium text-slate-700 block mb-1.5">Email</label>{inp('email', 'raj@example.com', 'email')}</div>
            <div><label className="text-sm font-medium text-slate-700 block mb-1.5">Phone</label>{inp('phone', '+91-9876543210')}</div>
            <div><label className="text-sm font-medium text-slate-700 block mb-1.5">Address</label>{inp('address', 'Bangalore, Karnataka')}</div>
            <div className="col-span-2"><label className="text-sm font-medium text-slate-700 block mb-1.5">Notes</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} rows={2} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-60">{saving ? 'Saving…' : editing ? 'Save Changes' : 'Create'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
