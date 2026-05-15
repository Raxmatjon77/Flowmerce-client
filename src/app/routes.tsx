import { createBrowserRouter } from 'react-router';
import { CustomerLayout } from './components/CustomerLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RouteErrorFallback } from './components/ErrorBoundary';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Orders } from './pages/Orders';
import { OrderDetail } from './pages/OrderDetail';
import { Shop } from './pages/Shop';
import { Checkout } from './pages/Checkout';
import { Notifications } from './pages/Notifications';
import { NotFound } from './pages/NotFound';

function Protected({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <CustomerLayout>{children}</CustomerLayout>
    </ProtectedRoute>
  );
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
    errorElement: <RouteErrorFallback />,
  },
  {
    path: '/register',
    element: <Register />,
    errorElement: <RouteErrorFallback />,
  },
  {
    path: '/',
    element: <Protected><Dashboard /></Protected>,
    errorElement: <RouteErrorFallback />,
  },
  {
    path: '/orders',
    element: <Protected><Orders /></Protected>,
    errorElement: <RouteErrorFallback />,
  },
  {
    path: '/orders/:id',
    element: <Protected><OrderDetail /></Protected>,
    errorElement: <RouteErrorFallback />,
  },
  {
    path: '/shop',
    element: <Protected><Shop /></Protected>,
    errorElement: <RouteErrorFallback />,
  },
  {
    path: '/shop/checkout',
    element: <Protected><Checkout /></Protected>,
    errorElement: <RouteErrorFallback />,
  },
  {
    path: '/notifications',
    element: <Protected><Notifications /></Protected>,
    errorElement: <RouteErrorFallback />,
  },
  {
    path: '*',
    element: <NotFound />,
    errorElement: <RouteErrorFallback />,
  },
]);
