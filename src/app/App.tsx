import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ErrorBoundary, RootErrorFallback } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary fallback={<RootErrorFallback />}>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
