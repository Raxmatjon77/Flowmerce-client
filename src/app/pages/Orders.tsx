import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
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
import { OrderStatus } from '../../lib/constants';
import { useApiData } from '../../lib/use-api';

const orderFilterOptions = [
  {
    value: '',
    label: 'All',
    activeClassName: 'bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-lg shadow-violet-500/20',
  },
  {
    value: OrderStatus.PENDING,
    label: 'Pending',
    activeClassName: 'bg-yellow-500/90 text-slate-950 hover:bg-yellow-400',
  },
  {
    value: OrderStatus.INVENTORY_RESERVED,
    label: 'Inventory Reserved',
    activeClassName: 'bg-orange-500/90 text-white hover:bg-orange-400',
  },
  {
    value: OrderStatus.PAYMENT_PROCESSED,
    label: 'Payment Processed',
    activeClassName: 'bg-sky-500/90 text-white hover:bg-sky-400',
  },
  {
    value: OrderStatus.CONFIRMED,
    label: 'Confirmed',
    activeClassName: 'bg-violet-500/90 text-white hover:bg-violet-400',
  },
  {
    value: OrderStatus.SHIPPED,
    label: 'Shipped',
    activeClassName: 'bg-emerald-500/90 text-white hover:bg-emerald-400',
  },
  {
    value: OrderStatus.DELIVERED,
    label: 'Delivered',
    activeClassName: 'bg-green-500/90 text-white hover:bg-green-400',
  },
  {
    value: OrderStatus.CANCELLED,
    label: 'Cancelled',
    activeClassName: 'bg-rose-500/90 text-white hover:bg-rose-400',
  },
] as const;

function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

export function Orders() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const orders = useApiData(
    () => customerApi.listOrders({ status: statusFilter || undefined, limit: 100 }),
    [statusFilter],
  );

  const filteredOrders = (orders.data?.data ?? []).filter((order) =>
    searchQuery ? order.id.toLowerCase().includes(searchQuery.toLowerCase()) : true,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">My Orders</h1>
        <p className="mt-1 text-gray-400">View and track all your orders.</p>
      </div>

      <Card className="border-white/10 bg-slate-900/50 p-6 backdrop-blur-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 lg:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by order ID..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="border-white/10 bg-white/5 pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {orderFilterOptions.map((option) => (
              <Button
                key={option.value || 'all'}
                variant="outline"
                size="sm"
                className={
                  statusFilter === option.value
                    ? `${option.activeClassName} border-transparent`
                    : 'border-slate-700 bg-slate-800/70 text-slate-200 hover:border-slate-500 hover:bg-slate-700/80 hover:text-white'
                }
                onClick={() => setStatusFilter(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {orders.loading ? <LoadingState label="Loading orders..." /> : null}
      {orders.error ? <ErrorState message={orders.error} onRetry={orders.reload} /> : null}
      {!orders.loading && !orders.error && filteredOrders.length === 0 ? (
        <EmptyState
          title="No orders found"
          description="Try widening your search or clearing the status filter."
        />
      ) : null}

      {!orders.loading && !orders.error && filteredOrders.length > 0 ? (
        <Card className="border-white/10 bg-slate-900/50 backdrop-blur-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-gray-400">Order ID</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Items</TableHead>
                <TableHead className="text-gray-400">Total</TableHead>
                <TableHead className="text-gray-400">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer border-white/10 hover:bg-white/5"
                  onClick={() => void navigate(`/orders/${order.id}`)}
                >
                  <TableCell className="font-mono text-purple-400">{order.id}</TableCell>
                  <TableCell><StatusBadge status={order.status} /></TableCell>
                  <TableCell className="text-white">{order.itemCount}</TableCell>
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
