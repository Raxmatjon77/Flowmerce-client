import { createBrowserRouter } from 'react-router';
import { CustomerLayout } from './components/CustomerLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
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
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/',
    element: <Protected><Dashboard /></Protected>,
  },
  {
    path: '/orders',
    element: <Protected><Orders /></Protected>,
  },
  {
    path: '/orders/:id',
    element: <Protected><OrderDetail /></Protected>,
  },
  {
    path: '/shop',
    element: <Protected><Shop /></Protected>,
  },
  {
    path: '/shop/checkout',
    element: <Protected><Checkout /></Protected>,
  },
  {
    path: '/notifications',
    element: <Protected><Notifications /></Protected>,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
