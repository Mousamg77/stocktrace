require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Supplier = require('../src/models/Supplier');
const Product = require('../src/models/Product');
const StockMovement = require('../src/models/StockMovement');
const Alert = require('../src/models/Alert');
const { MOVEMENT_TYPES, ALERT_TYPES, ALERT_STATUS, ROLES } = require('../src/config/constants');

const seedDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/stocktrace';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Supplier.deleteMany({}),
    Product.deleteMany({}),
    StockMovement.deleteMany({}),
    Alert.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // ─── Users ───────────────────────────────────────────────────────────────
  const [admin, manager, staff] = await User.create([
    { name: 'Alice Admin', email: 'admin@stocktrace.dev', password: 'Admin@123', role: ROLES.ADMIN },
    { name: 'Mike Manager', email: 'manager@stocktrace.dev', password: 'Manager@123', role: ROLES.MANAGER },
    { name: 'Sara Staff', email: 'staff@stocktrace.dev', password: 'Staff@123', role: ROLES.STAFF },
  ]);
  console.log('✅ Users created');

  // ─── Categories ──────────────────────────────────────────────────────────
  const [electronics, pharma, stationery, hardware, grocery] = await Category.create([
    { name: 'Electronics', description: 'Electronic devices and accessories' },
    { name: 'Pharmaceuticals', description: 'Medical and pharmaceutical products' },
    { name: 'Stationery', description: 'Office and school supplies' },
    { name: 'Hardware', description: 'Construction and repair materials' },
    { name: 'Grocery', description: 'Food and daily consumables' },
  ]);
  console.log('✅ Categories created');

  // ─── Suppliers ───────────────────────────────────────────────────────────
  const [techVen, mediSup, officePro, buildBase] = await Supplier.create([
    { name: 'TechVenture Pvt. Ltd.', contactPerson: 'Raj Mehta', email: 'raj@techventure.in', phone: '+91-9876543210', address: 'Bangalore, Karnataka' },
    { name: 'MediSupply Co.', contactPerson: 'Dr. Priya Nair', email: 'priya@medisupply.co.in', phone: '+91-9845678901', address: 'Mumbai, Maharashtra' },
    { name: 'OfficePro Traders', contactPerson: 'Amit Sharma', email: 'amit@officepro.in', phone: '+91-9712345678', address: 'Delhi, NCR' },
    { name: 'BuildBase Industries', contactPerson: 'Ravi Kumar', email: 'ravi@buildbase.in', phone: '+91-9600012345', address: 'Chennai, Tamil Nadu' },
  ]);
  console.log('✅ Suppliers created');

  // ─── Products ────────────────────────────────────────────────────────────
  const qr = () => `ST-${uuidv4()}`;
  const futureDate = (days) => { const d = new Date(); d.setDate(d.getDate() + days); return d; };
  const pastDate = (days) => { const d = new Date(); d.setDate(d.getDate() - days); return d; };

  const products = await Product.create([
    { name: 'USB-C Charging Cable 2m', sku: 'ELEC-001', qrId: qr(), category: electronics._id, brand: 'Anker', unit: 'pcs', quantity: 150, minThreshold: 20, costPrice: 249, sellingPrice: 399, supplier: techVen._id, location: 'Rack A-1', createdBy: admin._id },
    { name: 'Wireless Bluetooth Headphone', sku: 'ELEC-002', qrId: qr(), category: electronics._id, brand: 'Sony', unit: 'pcs', quantity: 8, minThreshold: 10, costPrice: 3499, sellingPrice: 5999, supplier: techVen._id, location: 'Rack A-2', createdBy: admin._id },
    { name: 'Mechanical Keyboard 87-Key', sku: 'ELEC-003', qrId: qr(), category: electronics._id, brand: 'Keychron', unit: 'pcs', quantity: 25, minThreshold: 5, costPrice: 4299, sellingPrice: 6499, supplier: techVen._id, location: 'Rack A-3', createdBy: manager._id },
    { name: 'Paracetamol 500mg Tablets (Strip)', sku: 'PHRM-001', qrId: qr(), category: pharma._id, brand: 'Cipla', unit: 'strips', quantity: 500, minThreshold: 50, costPrice: 15, sellingPrice: 25, supplier: mediSup._id, location: 'Shelf B-1', batchNumber: 'BA2024-01', mfgDate: pastDate(180), expiryDate: futureDate(180), createdBy: admin._id },
    { name: 'Vitamin C 1000mg Effervescent', sku: 'PHRM-002', qrId: qr(), category: pharma._id, brand: 'HealthVit', unit: 'tubes', quantity: 60, minThreshold: 15, costPrice: 120, sellingPrice: 199, supplier: mediSup._id, location: 'Shelf B-2', expiryDate: futureDate(20), batchNumber: 'BA2024-02', createdBy: admin._id },
    { name: 'Antiseptic Cream 30g', sku: 'PHRM-003', qrId: qr(), category: pharma._id, brand: 'Dettol', unit: 'tubes', quantity: 0, minThreshold: 20, costPrice: 45, sellingPrice: 79, supplier: mediSup._id, location: 'Shelf B-3', expiryDate: pastDate(10), batchNumber: 'BA2023-10', createdBy: manager._id },
    { name: 'A4 Paper Ream 500 sheets', sku: 'STAT-001', qrId: qr(), category: stationery._id, brand: 'ITC', unit: 'reams', quantity: 200, minThreshold: 30, costPrice: 180, sellingPrice: 250, supplier: officePro._id, location: 'Rack C-1', createdBy: admin._id },
    { name: 'Ballpoint Pen Box (12-pack)', sku: 'STAT-002', qrId: qr(), category: stationery._id, brand: 'Reynolds', unit: 'boxes', quantity: 5, minThreshold: 10, costPrice: 60, sellingPrice: 100, supplier: officePro._id, location: 'Rack C-2', createdBy: staff._id },
    { name: 'PVC Electrical Tape Roll', sku: 'HDWR-001', qrId: qr(), category: hardware._id, brand: '3M', unit: 'rolls', quantity: 80, minThreshold: 15, costPrice: 35, sellingPrice: 65, supplier: buildBase._id, location: 'Shelf D-1', createdBy: admin._id },
    { name: 'Portland Cement 50kg Bag', sku: 'HDWR-002', qrId: qr(), category: hardware._id, brand: 'UltraTech', unit: 'bags', quantity: 120, minThreshold: 20, costPrice: 420, sellingPrice: 580, supplier: buildBase._id, location: 'Warehouse D-3', createdBy: manager._id },
    { name: 'Basmati Rice Premium 5kg', sku: 'GROC-001', qrId: qr(), category: grocery._id, brand: 'India Gate', unit: 'bags', quantity: 3, minThreshold: 10, costPrice: 320, sellingPrice: 450, location: 'Store E-1', expiryDate: futureDate(365), createdBy: admin._id },
    { name: 'Cold-Pressed Coconut Oil 1L', sku: 'GROC-002', qrId: qr(), category: grocery._id, brand: 'Parachute', unit: 'bottles', quantity: 45, minThreshold: 10, costPrice: 180, sellingPrice: 260, location: 'Store E-2', expiryDate: futureDate(545), createdBy: admin._id },
  ]);
  console.log('✅ Products created');

  // ─── Stock Movements ─────────────────────────────────────────────────────
  await StockMovement.create([
    { product: products[0]._id, type: MOVEMENT_TYPES.STOCK_IN, quantity: 50, previousQuantity: 100, newQuantity: 150, performedBy: manager._id, supplier: techVen._id, referenceNo: 'PO-2024-001', notes: 'Monthly restock' },
    { product: products[1]._id, type: MOVEMENT_TYPES.STOCK_OUT, quantity: 2, previousQuantity: 10, newQuantity: 8, performedBy: staff._id, referenceNo: 'SO-2024-001', notes: 'Sold to showroom' },
    { product: products[6]._id, type: MOVEMENT_TYPES.STOCK_IN, quantity: 100, previousQuantity: 100, newQuantity: 200, performedBy: manager._id, supplier: officePro._id, referenceNo: 'PO-2024-005', notes: 'Bulk order Q4' },
    { product: products[3]._id, type: MOVEMENT_TYPES.STOCK_IN, quantity: 200, previousQuantity: 300, newQuantity: 500, performedBy: admin._id, supplier: mediSup._id, notes: 'Emergency restock' },
    { product: products[9]._id, type: MOVEMENT_TYPES.STOCK_OUT, quantity: 30, previousQuantity: 150, newQuantity: 120, performedBy: staff._id, referenceNo: 'SO-2024-010', notes: 'Construction project' },
    { product: products[10]._id, type: MOVEMENT_TYPES.STOCK_OUT, quantity: 5, previousQuantity: 8, newQuantity: 3, performedBy: staff._id, notes: 'Weekly sale' },
  ]);
  console.log('✅ Stock movements created');

  // ─── Alerts (pre-seeded) ─────────────────────────────────────────────────
  await Alert.create([
    { product: products[1]._id, type: ALERT_TYPES.LOW_STOCK, status: ALERT_STATUS.ACTIVE, message: 'Wireless Bluetooth Headphone stock is low (8 pcs).' },
    { product: products[5]._id, type: ALERT_TYPES.EXPIRED, status: ALERT_STATUS.ACTIVE, message: 'Antiseptic Cream 30g has expired.' },
    { product: products[5]._id, type: ALERT_TYPES.OUT_OF_STOCK, status: ALERT_STATUS.ACTIVE, message: 'Antiseptic Cream 30g is out of stock.' },
    { product: products[4]._id, type: ALERT_TYPES.EXPIRY_SOON, status: ALERT_STATUS.ACTIVE, message: 'Vitamin C 1000mg expires within 30 days.' },
    { product: products[7]._id, type: ALERT_TYPES.LOW_STOCK, status: ALERT_STATUS.ACTIVE, message: 'Ballpoint Pen Box stock is low (5 boxes).' },
    { product: products[10]._id, type: ALERT_TYPES.LOW_STOCK, status: ALERT_STATUS.ACTIVE, message: 'Basmati Rice stock is low (3 bags).' },
  ]);
  console.log('✅ Alerts created');

  console.log('\n🎉 Seed completed successfully!\n');
  console.log('Demo Accounts:');
  console.log('  Admin:   admin@stocktrace.dev    / Admin@123');
  console.log('  Manager: manager@stocktrace.dev  / Manager@123');
  console.log('  Staff:   staff@stocktrace.dev    / Staff@123');
  console.log('');

  await mongoose.disconnect();
  process.exit(0);
};

seedDB().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
