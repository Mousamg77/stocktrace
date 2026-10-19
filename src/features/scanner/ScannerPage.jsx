import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Upload, Search, X, Package } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { getProductByQr, getProducts } from '../../api/product.api';
import Badge from '../../components/Badge';
import toast from 'react-hot-toast';

const QR_READER_ID = 'qr-reader-element';

export default function ScannerPage() {
  const [scanned, setScanned] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [manualQuery, setManualQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);

  // Low-level Html5Qrcode instance — never recreated on every render
  const qrCodeRef = useRef(null);
  const isRunningRef = useRef(false);

  const fetchProduct = async (qrOrSku, isQr = true) => {
    try {
      let res;
      if (isQr) {
        res = await getProductByQr(qrOrSku);
      } else {
        const r = await getProducts({ search: qrOrSku, limit: 1 });
        const prods = r.data.data.products;
        if (!prods.length) throw new Error('Product not found');
        res = { data: { data: { product: prods[0] } } };
      }
      setScanned(res.data.data.product);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Product not found');
    }
  };

  const stopCamera = useCallback(async () => {
    if (qrCodeRef.current && isRunningRef.current) {
      try {
        await qrCodeRef.current.stop();
        await qrCodeRef.current.clear();
      } catch (_) {
        // ignore stop errors
      }
      isRunningRef.current = false;
    }
    setScanning(false);
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so the same file can be re-selected
    e.target.value = '';

    setUploading(true);
    setScanned(null);
    setCameraError('');
    try {
      // Use a temporary Html5Qrcode instance just for file scanning
      const scanner = new Html5Qrcode('qr-file-scanner-tmp');
      const decoded = await scanner.scanFile(file, false);
      await scanner.clear();
      toast.success('QR code read from image!');
      fetchProduct(decoded, true);
    } catch (err) {
      toast.error('Could not read a QR code from the uploaded image.');
    } finally {
      setUploading(false);
    }
  };

  const startCamera = useCallback(async () => {
    setCameraError('');
    setScanned(null);
    setScanning(true);
  }, []);

  // Effect runs only when `scanning` flips to true and the DOM node exists
  useEffect(() => {
    if (!scanning) return;

    let cancelled = false;

    const init = async () => {
      // Slight delay to ensure the DOM node is mounted after state update
      await new Promise((r) => setTimeout(r, 100));
      if (cancelled) return;

      const element = document.getElementById(QR_READER_ID);
      if (!element) {
        setCameraError('Camera container not found. Please try again.');
        setScanning(false);
        return;
      }

      // Create a fresh instance every time scanning starts
      qrCodeRef.current = new Html5Qrcode(QR_READER_ID);

      try {
        await qrCodeRef.current.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (cancelled || !isRunningRef.current) return;
            stopCamera();
            toast.success('QR code scanned!');
            fetchProduct(decodedText, true);
          },
          () => { /* scan frame errors are expected — ignore */ }
        );
        if (!cancelled) isRunningRef.current = true;
      } catch (err) {
        if (!cancelled) {
          const msg =
            err?.message?.includes('Permission')
              ? 'Camera permission denied. Please allow camera access and try again.'
              : err?.message || 'Could not start camera.';
          setCameraError(msg);
          setScanning(false);
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      // Async cleanup — don't await in the cleanup fn
      if (qrCodeRef.current && isRunningRef.current) {
        qrCodeRef.current.stop().catch(() => {});
        isRunningRef.current = false;
      }
    };
  }, [scanning]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleManualSearch = async (e) => {
    e.preventDefault();
    if (!manualQuery.trim()) return;
    setSearching(true);
    await fetchProduct(manualQuery.trim(), false);
    setSearching(false);
  };

  const stockColor = scanned
    ? scanned.stockStatus === 'out_of_stock'
      ? 'danger'
      : scanned.stockStatus === 'low_stock'
      ? 'warning'
      : 'success'
    : 'slate';

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Scan QR Code</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Use camera to scan a product QR code or search manually
        </p>
      </div>

      {/* Camera / Manual */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
        <div className="flex gap-3">
          <button
            onClick={scanning ? stopCamera : startCamera}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors ${
              scanning
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {scanning ? (
              <>
                <X className="w-4 h-4" /> Stop Camera
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" /> Start Camera
              </>
            )}
          </button>

          {/* Upload QR Image */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || scanning}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-50"
            title="Upload a QR code image"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Reading…' : 'Upload QR'}
          </button>

          {/* Hidden file input — accepts image formats incl. SVG */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.svg"
            className="hidden"
            onChange={handleFileUpload}
          />
          {/* Invisible element required by Html5Qrcode for file scanning */}
          <div id="qr-file-scanner-tmp" className="hidden" />
        </div>

        {/* Stable DOM anchor — always rendered, just hidden when not scanning */}
        <div
          id={QR_READER_ID}
          className={`rounded-xl overflow-hidden border border-slate-200 ${
            scanning ? 'block' : 'hidden'
          }`}
        />

        {cameraError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {cameraError}
          </p>
        )}

        <div className="relative flex items-center gap-2">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 font-medium">OR SEARCH MANUALLY</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <form onSubmit={handleManualSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={manualQuery}
              onChange={(e) => setManualQuery(e.target.value)}
              placeholder="Enter product name or SKU…"
              className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
          >
            {searching ? 'Searching…' : 'Search'}
          </button>
        </form>
      </div>

      {/* Scanned result */}
      {scanned && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 animate-fade-in space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">{scanned.name}</h3>
                <p className="text-xs text-slate-400 font-mono">{scanned.sku}</p>
              </div>
            </div>
            <Badge color={stockColor}>{scanned.stockStatus?.replace('_', ' ')}</Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'In Stock', value: `${scanned.quantity} ${scanned.unit}` },
              { label: 'Min Threshold', value: scanned.minThreshold },
              { label: 'Category', value: scanned.category?.name },
              { label: 'Location', value: scanned.location || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {scanned.expiryDate && (
            <div
              className={`p-3 rounded-lg text-sm ${
                new Date(scanned.expiryDate) < new Date()
                  ? 'bg-red-50 text-red-700'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              Expiry: {new Date(scanned.expiryDate).toLocaleDateString('en-IN')}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Link
              to={`/stock-in?productId=${scanned._id}`}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Stock In
            </Link>
            <Link
              to={`/stock-out?productId=${scanned._id}`}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Stock Out
            </Link>
            <Link
              to={`/history?productId=${scanned._id}`}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold rounded-lg transition-colors"
            >
              View History
            </Link>
            <Link
              to={`/products/${scanned._id}`}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold rounded-lg transition-colors"
            >
              Full Details
            </Link>
            <button
              onClick={() => {
                setScanned(null);
                setManualQuery('');
              }}
              className="px-4 py-2 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 text-sm font-semibold rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
