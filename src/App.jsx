import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/AuthContext';
import AppRouter from './routes/AppRouter';

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: '#1e293b', color: '#f8fafc', fontSize: '14px', borderRadius: '12px', padding: '12px 16px' },
          success: { iconTheme: { primary: '#22c55e', secondary: '#f0fdf4' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fef2f2' } },
        }}
      />
      <AppRouter />
    </AuthProvider>
  );
}
