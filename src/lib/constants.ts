// Domain enums — single source of truth for all status/type/channel values.
// Values match what the backend API produces.

export enum OrderStatus {
  PENDING = 'PENDING',
  INVENTORY_RESERVED = 'INVENTORY_RESERVED',
  PAYMENT_PROCESSED = 'PAYMENT_PROCESSED',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum ShipmentStatus {
  PENDING = 'PENDING',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED',
}

export enum NotificationStatus {
  SENT = 'SENT',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
}

// Lowercase — matches what the backend sends for these fields.
export enum ServiceHealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  DOWN = 'down',
}

export enum StockState {
  HEALTHY = 'healthy',
  LOW = 'low',
  CRITICAL = 'critical',
}

export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
  SERVICE = 'service',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum InventoryAction {
  RESERVE = 'reserve',
  RELEASE = 'release',
}

export enum OrderAction {
  CONFIRM = 'confirm',
  CANCEL = 'cancel',
}
