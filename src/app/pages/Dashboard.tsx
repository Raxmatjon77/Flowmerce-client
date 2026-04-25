import { Link } from 'react-router';
import { ShoppingCart, Package, CheckCircle, ArrowRight } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { customerApi } from '../../lib/customer-api';
import { getStoredUserId } from '../../lib/auth';
import { useApiData } from '../../lib/use-api';
import { OrderStatus } from '../../lib/constants';

function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

export function Dashboard() {
  const userId = getStoredUserId() ?? 'there';

  const { data, loading, error, reload } = useApiData(
    () => customerApi.listOrders({ limit: 5 }),
    [],
  );

  const orders = data?.data ?? [];
  const totalOrders = data?.meta.total ?? 0;
  const activeOrders = orders.filter(
    (o) => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELLED,
  ).length;
  const deliveredOrders = orders.filter((o) => o.status === OrderStatus.DELIVERED).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Welcome back, {userId}</h1>
        <p className="mt-1 text-gray-400">Here's a summary of your recent orders.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Total Orders"
          value={totalOrders}
          icon={ShoppingCart}
          gradient="from-blue-500/10 to-cyan-500/10"
        />
        <StatCard
          title="Active Orders"
          value={activeOrders}
          icon={Package}
          description="In progress"
          gradient="from-purple-500/10 to-pink-500/10"
        />
        <StatCard
          title="Delivered"
          value={deliveredOrders}
          icon={CheckCircle}
          gradient="from-green-500/10 to-emerald-500/10"
        />
      </div>

      {loading ? <LoadingState label="Loading your orders..." /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}

      {!loading && !error && orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Head to the shop to place your first order."
          action={
            <Button asChild className="bg-gradient-to-r from-purple-500 to-blue-500">
              <Link to="/shop">Browse Shop</Link>
            </Button>
          }
        />
      ) : null}

      {!loading && !error && orders.length > 0 ? (
        <Card className="border-white/10 bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
            <Button asChild variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
              <Link to="/orders">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-gray-400">Order</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Total</TableHead>
                <TableHead className="text-gray-400">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer border-white/10 hover:bg-white/5"
                >
                  <TableCell>
                    <Link to={`/orders/${order.id}`} className="font-mono text-purple-400 hover:text-purple-300">
                      {order.id}
                    </Link>
                  </TableCell>
                  <TableCell><StatusBadge status={order.status} /></TableCell>
                  <TableCell className="text-white">{formatCurrency(order.totalAmount, order.currency)}</TableCell>
                  <TableCell className="text-gray-400">{formatDate(order.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : null}
    </div>
  );
}
