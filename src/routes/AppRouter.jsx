import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { ProtectedRoute, RoleRoute, GuestRoute } from './ProtectedRoute';

// Auth pages
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';

// App pages
import DashboardPage from '../features/dashboard/DashboardPage';
import ProductsPage from '../features/products/ProductsPage';
import ProductDetailPage from '../features/products/ProductDetailPage';
import ProductFormPage from '../features/products/ProductFormPage';
import ScannerPage from '../features/scanner/ScannerPage';
import StockInPage from '../features/inventory/StockInPage';
import StockOutPage from '../features/inventory/StockOutPage';
import StockHistoryPage from '../features/inventory/StockHistoryPage';
import CategoriesPage from '../features/categories/CategoriesPage';
import SuppliersPage from '../features/suppliers/SuppliersPage';
import AlertsPage from '../features/alerts/AlertsPage';
import ReportsPage from '../features/reports/ReportsPage';
import UsersPage from '../features/users/UsersPage';
import SettingsPage from '../features/settings/SettingsPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Guest-only routes */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/new" element={<ProductFormPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/products/:id/edit" element={<ProductFormPage />} />
            <Route path="/scanner" element={<ScannerPage />} />
            <Route path="/stock-in" element={<StockInPage />} />
            <Route path="/stock-out" element={<StockOutPage />} />
            <Route path="/history" element={<StockHistoryPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            {/* Admin-only */}
            <Route element={<RoleRoute roles={['admin']} />}>
              <Route path="/users" element={<UsersPage />} />
            </Route>
          </Route>
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<div className="flex h-screen items-center justify-center flex-col gap-2"><p className="text-5xl font-bold text-slate-200">404</p><p className="text-slate-500">Page not found</p></div>} />
      </Routes>
    </BrowserRouter>
  );
}
