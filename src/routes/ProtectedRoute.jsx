import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export function RoleRoute({ roles }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-4xl font-bold text-slate-200">403</p>
        <p className="text-slate-600 font-medium">You don't have permission to access this page.</p>
      </div>
    );
  }
  return <Outlet />;
}

export function GuestRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? <Outlet /> : <Navigate to="/" replace />;
}
