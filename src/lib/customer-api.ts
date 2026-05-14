import { apiGet, apiPost, API_BASE_URL } from './api';
import { getStoredToken } from './auth';
import type { components } from '../types/api.generated';

// --- Generated types (exact match with backend schema) ---
export type OrderItem = components['schemas']['OrderItemResponseDto'];
export type InventoryItem = components['schemas']['InventoryResponseDto'];
export type NotificationItem = components['schemas']['NotificationResponseDto'];

// --- Hand-written types (backend returns richer shapes not captured in DTOs) ---
export interface OrderListItem {
  id: string;
  customerId: string;
  status: string;
  totalAmount: number;
  currency: string;
  itemCount: number;
  shippingAddress: string;
  createdAt: string;
}

export interface PaymentRef {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  transactionId: string | null;
}

export interface ShipmentRef {
  id: string;
  orderId: string;
  status: string;
  trackingNumber: string | null;
  carrierName: string | null;
  estimatedDelivery: string | null;
}

export interface OrderDetail extends OrderListItem {
  updatedAt: string;
  items: OrderItem[];
  payment: PaymentRef | null;
  shipment: ShipmentRef | null;
}

// --- Frontend-only types ---
export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; limit: number };
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CartItem {
  inventoryItemId: string;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number; // cents
}

// --- API calls ---
export const customerApi = {
  listOrders: (params?: Record<string, string | number | undefined>) =>
    apiGet<PaginatedResponse<OrderListItem>>('/api/v1/orders', params as Record<string, string | number | boolean | undefined>),

  getOrder: (id: string) =>
    apiGet<OrderDetail>(`/api/v1/orders/${id}`),

  cancelOrder: (id: string) =>
    apiPost<{ message: string }>(`/api/v1/orders/${id}/cancel`),

  placeOrder: (payload: {
    customerId: string;
    items: Array<{ productId: string; productName: string; quantity: number; unitPrice: number; currency: string }>;
    shippingAddress: ShippingAddress;
  }) => apiPost<OrderDetail>('/api/v1/orders', payload),

  listInventory: (params?: Record<string, string | number | undefined>) =>
    apiGet<PaginatedResponse<InventoryItem>>('/api/v1/inventory', params as Record<string, string | number | boolean | undefined>),

  listNotifications: () =>
    apiGet<PaginatedResponse<NotificationItem>>('/api/v1/notifications'),
};

// Cart helpers (localStorage)
export const CART_KEY = 'flowmerce.cart';

export function getCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]') as CartItem[];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(item: CartItem): CartItem[] {
  const cart = getCart();
  const existing = cart.find((c) => c.inventoryItemId === item.inventoryItemId);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }
  saveCart(cart);
  return cart;
}

export function removeFromCart(inventoryItemId: string): CartItem[] {
  const cart = getCart().filter((c) => c.inventoryItemId !== inventoryItemId);
  saveCart(cart);
  return cart;
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY);
}

export function formatPrice(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}

export interface OrderStatusEventPayload {
  orderId: string;
  status: string;
  updatedAt: string;
}

export function subscribeToOrderEvents(
  orderId: string,
  onStatusUpdate: (event: OrderStatusEventPayload) => void,
  onError?: (err: Event) => void,
): EventSource {
  const token = getStoredToken() ?? '';
  const url = `${API_BASE_URL}/api/v1/orders/${orderId}/events?token=${encodeURIComponent(token)}`;
  const es = new EventSource(url);

  es.addEventListener('order.status.updated', (e: MessageEvent) => {
    try {
      onStatusUpdate(JSON.parse(e.data as string) as OrderStatusEventPayload);
    } catch {
      // malformed event — ignore
    }
  });

  if (onError) {
    es.onerror = onError;
  }

  return es;
}
