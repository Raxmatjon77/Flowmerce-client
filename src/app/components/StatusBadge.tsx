import { Badge } from './ui/badge';
import {
  NotificationStatus,
  OrderStatus,
  PaymentStatus,
  ServiceHealthStatus,
  ShipmentStatus,
  StockState,
  UserRole,
  UserStatus,
} from '../../lib/constants';

interface StatusBadgeProps {
  status: string;
}

// Keyed by lowercase value — handles both 'PENDING' and 'pending' from the API.
const STATUS_COLORS: Record<string, string> = {
  // Order statuses
  [OrderStatus.PENDING.toLowerCase()]: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  [OrderStatus.INVENTORY_RESERVED.toLowerCase()]: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  [OrderStatus.PAYMENT_PROCESSED.toLowerCase()]: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  [OrderStatus.CONFIRMED.toLowerCase()]: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  [OrderStatus.SHIPPED.toLowerCase()]: 'bg-green-500/20 text-green-300 border-green-500/30',
  [OrderStatus.DELIVERED.toLowerCase()]: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  [OrderStatus.CANCELLED.toLowerCase()]: 'bg-red-500/20 text-red-300 border-red-500/30',

  // User statuses
  [UserStatus.ACTIVE]: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  [UserStatus.INACTIVE]: 'bg-gray-500/20 text-gray-300 border-gray-500/30',

  // Payment statuses
  [PaymentStatus.COMPLETED.toLowerCase()]: 'bg-green-500/20 text-green-300 border-green-500/30',
  [PaymentStatus.PROCESSING.toLowerCase()]: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  [PaymentStatus.FAILED.toLowerCase()]: 'bg-red-500/20 text-red-300 border-red-500/30',
  [PaymentStatus.REFUNDED.toLowerCase()]: 'bg-purple-500/20 text-purple-300 border-purple-500/30',

  // Shipment statuses
  [ShipmentStatus.PENDING.toLowerCase()]: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  [ShipmentStatus.PICKED_UP.toLowerCase()]: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  [ShipmentStatus.IN_TRANSIT.toLowerCase()]: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  [ShipmentStatus.DELIVERED.toLowerCase()]: 'bg-green-500/20 text-green-300 border-green-500/30',
  [ShipmentStatus.RETURNED.toLowerCase()]: 'bg-red-500/20 text-red-300 border-red-500/30',

  // Notification statuses
  [NotificationStatus.SENT.toLowerCase()]: 'bg-green-500/20 text-green-300 border-green-500/30',
  [NotificationStatus.PENDING.toLowerCase()]: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  [NotificationStatus.FAILED.toLowerCase()]: 'bg-red-500/20 text-red-300 border-red-500/30',

  // Health statuses (already lowercase)
  [ServiceHealthStatus.HEALTHY]: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  [ServiceHealthStatus.DEGRADED]: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  [ServiceHealthStatus.DOWN]: 'bg-red-500/20 text-red-300 border-red-500/30',

  // Stock states (already lowercase)
  [StockState.LOW]: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  [StockState.CRITICAL]: 'bg-red-500/20 text-red-300 border-red-500/30',

  // Roles (already lowercase)
  [UserRole.ADMIN]: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  [UserRole.CUSTOMER]: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  [UserRole.SERVICE]: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
};

const DEFAULT_COLOR = 'bg-gray-500/20 text-gray-300 border-gray-500/30';

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const color = STATUS_COLORS[status.toLowerCase()] ?? DEFAULT_COLOR;

  return (
    <Badge variant="outline" className={`${color} border font-medium`}>
      {formatStatus(status)}
    </Badge>
  );
}
