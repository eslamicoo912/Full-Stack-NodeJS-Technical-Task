import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/auth-context';

// Blocks unauthenticated users from reaching the app pages
function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  // Wait for the session restore before deciding
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-500">
        Loading...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}

export default ProtectedRoute;
