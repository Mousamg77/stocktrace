import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit3, Archive, Package, Download, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import * as productApi from '../../api/product.api';
import Badge from '../../components/Badge';
import { useAuth } from '../../hooks/AuthContext';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/ConfirmDialog';

const Section = ({ title, children }) => (
  <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">{title}</h3>
    {children}
  </div>
);
const Field = ({ label, value }) => (
  <div>
    <p className="text-xs text-slate-400 mb-0.5">{label}</p>
    <p className="text-sm font-medium text-slate-800">{value || '—'}</p>
  </div>
);

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canManage } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showArchive, setShowArchive] = useState(false);
  const [archiving, setArchiving] = useState(false);

  useEffect(() => {
    productApi.getProduct(id)
      .then(r => setProduct(r.data.data.product))
      .catch(() => { toast.error('Product not found'); navigate('/products'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleArchive = async () => {
    setArchiving(true);
    try {
      await productApi.archiveProduct(id);
      toast.success('Product archived');
      navigate('/products');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to archive'); }
    finally { setArchiving(false); }
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('product-qr-svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${product.sku}-qr.svg`; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!product) return null;

  const stockColor = product.stockStatus === 'out_of_stock' ? 'danger' : product.stockStatus === 'low_stock' ? 'warning' : 'success';

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <button onClick={() => navigate('/products')} className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 text-slate-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-800">{product.name}</h1>
          <p className="text-sm text-slate-400"><code>{product.sku}</code> · {product.category?.name}</p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Link to={`/products/${id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
              <Edit3 className="w-4 h-4" /> Edit
            </Link>
            {product.isActive && (
              <button onClick={() => setShowArchive(true)} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-red-200 rounded-lg hover:bg-red-50 text-red-600">
                <Archive className="w-4 h-4" /> Archive
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-5">
          <Section title="Stock Status">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-slate-800">{product.quantity}</p>
                <p className="text-xs text-slate-500 mt-1">{product.unit} in stock</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-xl font-bold text-amber-600">{product.minThreshold}</p>
                <p className="text-xs text-slate-500 mt-1">Min threshold</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-xl font-bold text-green-600">₹{(product.quantity * product.costPrice).toLocaleString('en-IN')}</p>
                <p className="text-xs text-slate-500 mt-1">Inventory value</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Badge color={stockColor}>{product.stockStatus?.replace('_',' ')}</Badge>
              {product.expiryStatus !== 'no_expiry' && (
                <Badge color={product.expiryStatus === 'expired' ? 'danger' : product.expiryStatus === 'expiring_soon' ? 'warning' : 'success'}>
                  {product.expiryStatus?.replace('_',' ')}
                </Badge>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <Link to={`/stock-in?productId=${id}`} className="px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium">Stock In</Link>
              <Link to={`/stock-out?productId=${id}`} className="px-3 py-2 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors font-medium">Stock Out</Link>
              <Link to={`/history?productId=${id}`} className="px-3 py-2 text-sm border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors font-medium">History</Link>
            </div>
          </Section>

          <Section title="Product Details">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="Brand" value={product.brand} />
              <Field label="Unit" value={product.unit} />
              <Field label="Location" value={product.location} />
              <Field label="Cost Price" value={`₹${product.costPrice?.toLocaleString('en-IN')}`} />
              <Field label="Selling Price" value={product.sellingPrice ? `₹${product.sellingPrice?.toLocaleString('en-IN')}` : '—'} />
              <Field label="Supplier" value={product.supplier?.name} />
              <Field label="Batch Number" value={product.batchNumber} />
              <Field label="Mfg Date" value={product.mfgDate ? new Date(product.mfgDate).toLocaleDateString('en-IN') : '—'} />
              <Field label="Expiry Date" value={product.expiryDate ? new Date(product.expiryDate).toLocaleDateString('en-IN') : '—'} />
            </div>
            {product.description && <p className="mt-4 text-sm text-slate-600">{product.description}</p>}
          </Section>
        </div>

        {/* Right: QR */}
        <div className="space-y-5">
          <Section title="QR Code">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-inner">
                <QRCodeSVG id="product-qr-svg" value={product.qrId} size={160} level="M" includeMargin />
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 font-mono">{product.qrId}</p>
              </div>
              <div className="flex gap-2 w-full">
                <button onClick={handleDownloadQR} className="flex-1 flex items-center justify-center gap-2 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors">
                  <Download className="w-4 h-4" /> Download SVG
                </button>
                <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors">
                  <Printer className="w-4 h-4" /> Print Label
                </button>
              </div>
            </div>
          </Section>
          <Section title="Info">
            <div className="space-y-3">
              <Field label="Created by" value={product.createdBy?.name} />
              <Field label="Added" value={new Date(product.createdAt).toLocaleDateString('en-IN')} />
              <Field label="Last updated" value={new Date(product.updatedAt).toLocaleDateString('en-IN')} />
              <div><p className="text-xs text-slate-400 mb-0.5">Status</p>
                <Badge color={product.isActive ? 'success' : 'slate'}>{product.isActive ? 'Active' : 'Archived'}</Badge>
              </div>
            </div>
          </Section>
        </div>
      </div>

      <ConfirmDialog isOpen={showArchive} onClose={() => setShowArchive(false)} onConfirm={handleArchive}
        loading={archiving} title="Archive Product"
        message={`Archive "${product.name}"? It will no longer appear in active inventory.`}
        confirmText="Archive" />
    </div>
  );
}
