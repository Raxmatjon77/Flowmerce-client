import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, CreditCard, Package, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { StatusBadge } from '../components/StatusBadge';
import { ErrorState, LoadingState } from '../components/AsyncState';
import { customerApi } from '../../lib/customer-api';
import { useApiData } from '../../lib/use-api';
import { OrderStatus } from '../../lib/constants';

function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function formatDateTime(value: string | null) {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString();
}

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [cancelling, setCancelling] = useState(false);

  const { data: order, loading, error, reload } = useApiData(
    () => customerApi.getOrder(id!),
    [id],
  );

  async function handleCancel() {
    if (!id) return;
    setCancelling(true);
    try {
      await customerApi.cancelOrder(id);
      toast.success('Order cancelled successfully.');
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <Link to="/orders">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
      </div>

      {loading ? <LoadingState label="Loading order..." /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}

      {order ? (
        <div className="space-y-6">
          {/* Header card */}
          <Card className="border-white/10 bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm text-gray-400">Order ID</p>
                <p className="mt-1 font-mono text-xl text-white">{order.id}</p>
                <div className="mt-3">
                  <StatusBadge status={order.status} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Total</p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {formatCurrency(order.totalAmount, order.currency)}
                </p>
                <p className="text-xs text-gray-500">Updated {formatDateTime(order.updatedAt)}</p>
              </div>
            </div>
          </Card>

          {/* Items card */}
          <Card className="border-white/10 bg-white/5 p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
              <Package className="h-4 w-4" />
              Items
            </h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg bg-slate-900/60 p-3">
                  <div>
                    <p className="font-medium text-white">{item.productName}</p>
                    <p className="text-xs text-gray-500">{item.productId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">Qty {item.quantity}</p>
                    <p className="text-xs text-gray-400">{formatCurrency(item.totalPrice, item.currency)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Payment card */}
          {order.payment ? (
            <Card className="border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
                <CreditCard className="h-4 w-4" />
                Payment
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                <p className="text-sm text-gray-300">Method: <span className="text-white">{order.payment.method}</span></p>
                <p className="text-sm text-gray-300">Amount: <span className="text-white">{formatCurrency(order.payment.amount, order.payment.currency)}</span></p>
                <div className="text-sm text-gray-300">Status: <StatusBadge status={order.payment.status} /></div>
                {order.payment.transactionId && (
                  <p className="text-sm text-gray-300">Transaction: <span className="font-mono text-white">{order.payment.transactionId}</span></p>
                )}
              </div>
            </Card>
          ) : null}

          {/* Shipment card */}
          {order.shipment ? (
            <Card className="border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
                <Truck className="h-4 w-4" />
                Shipment
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                <p className="text-sm text-gray-300">Carrier: <span className="text-white">{order.shipment.carrierName ?? 'Pending assignment'}</span></p>
                <p className="text-sm text-gray-300">Tracking: <span className="text-white">{order.shipment.trackingNumber ?? 'Not available'}</span></p>
                {order.shipment.estimatedDelivery && (
                  <p className="text-sm text-gray-300">Est. Delivery: <span className="text-white">{formatDateTime(order.shipment.estimatedDelivery)}</span></p>
                )}
                <div className="text-sm text-gray-300">Status: <StatusBadge status={order.shipment.status} /></div>
              </div>
            </Card>
          ) : null}

          {/* Cancel button */}
          {order.status === OrderStatus.PENDING ? (
            <div>
              <Button
                variant="outline"
                className="border-red-500/30 text-red-300 hover:bg-red-500/10"
                disabled={cancelling}
                onClick={() => void handleCancel()}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
