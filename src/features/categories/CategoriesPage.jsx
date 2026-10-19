import { useState, useEffect } from 'react';
import { Tags, Plus, Edit3, ToggleLeft, ToggleRight } from 'lucide-react';
import { getCategories, createCategory, updateCategory } from '../../api/category.api';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../hooks/AuthContext';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
  const { canManage } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getCategories({ includeInactive: true });
      setCategories(res.data.data.categories);
    } catch { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openModal = (cat = null) => {
    setEditing(cat);
    setForm(cat ? { name: cat.name, description: cat.description || '' } : { name: '', description: '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Category name is required');
    setSaving(true);
    try {
      if (editing) {
        await updateCategory(editing._id, form);
        toast.success('Category updated');
      } else {
        await createCategory(form);
        toast.success('Category created');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleToggle = async (cat) => {
    try {
      await updateCategory(cat._id, { isActive: !cat.isActive });
      toast.success(`Category ${cat.isActive ? 'deactivated' : 'activated'}`);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Categories</h1>
          <p className="text-sm text-slate-500">{categories.length} categories</p>
        </div>
        {canManage && (
          <button onClick={() => openModal()} className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Add Category
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({length:6}).map((_,i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
          </div>
        ) : categories.length === 0 ? (
          <EmptyState title="No categories yet" description="Add your first category to organize products." icon={<Tags className="w-8 h-8 text-slate-400" />} />
        ) : (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => (
              <div key={cat._id} className={`border rounded-xl p-4 flex flex-col gap-2 transition-all ${cat.isActive ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <Tags className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{cat.name}</p>
                      {cat.description && <p className="text-xs text-slate-400 line-clamp-1">{cat.description}</p>}
                    </div>
                  </div>
                  <Badge color={cat.isActive ? 'success' : 'slate'}>{cat.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>
                {canManage && (
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => openModal(cat)} className="flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => handleToggle(cat)} className="flex items-center gap-1 text-xs text-slate-500 hover:underline ml-auto">
                      {cat.isActive ? <ToggleLeft className="w-3.5 h-3.5" /> : <ToggleRight className="w-3.5 h-3.5" />}
                      {cat.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'New Category'} size="sm">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Category Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. Electronics"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={2}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-60">
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
