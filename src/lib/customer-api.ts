import { apiGet, apiPost, apiDelete, API_BASE_URL } from './api';
import { getStoredToken } from './auth';
import type { components } from '../types/api.generated';
import type { ConversationDto, MessageDto, AttachmentDto } from '../types/support';
import type { CouponValidationDto } from '../types/coupon';

export type { ConversationDto, MessageDto, AttachmentDto };

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
    couponCode?: string | null;
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
  void syncCartToServer(cart);
  return cart;
}

export function removeFromCart(inventoryItemId: string): CartItem[] {
  const cart = getCart().filter((c) => c.inventoryItemId !== inventoryItemId);
  saveCart(cart);
  void syncCartToServer(cart);
  return cart;
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY);
}

// --- Server-side cart sync ---

interface ServerCartItemShape {
  inventoryItemId: string;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export async function fetchServerCart(): Promise<CartItem[]> {
  try {
    const result = await apiGet<{ items: ServerCartItemShape[] }>('/api/v1/cart');
    return result.items.map((i) => ({
      inventoryItemId: i.inventoryItemId,
      sku: i.sku,
      productName: i.productName,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    }));
  } catch {
    // Server cart fetch failure is non-fatal — return empty
    return [];
  }
}

export async function syncCartToServer(items: CartItem[]): Promise<void> {
  try {
    await apiPost<void>('/api/v1/cart/sync', {
      items: items.map((i) => ({
        inventoryItemId: i.inventoryItemId,
        sku: i.sku,
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
    });
  } catch {
    // Sync failure is non-fatal — localStorage remains the source of truth
  }
}

export async function clearServerCart(): Promise<void> {
  try {
    await apiDelete('/api/v1/cart');
  } catch {
    // Non-fatal
  }
}

/**
 * Merge server and local carts. Local item quantities win for duplicates
 * (local cart reflects the most recent user intent on this device).
 */
export function mergeCart(server: CartItem[], local: CartItem[]): CartItem[] {
  const merged = new Map<string, CartItem>();
  for (const item of server) {
    merged.set(item.inventoryItemId, item);
  }
  for (const item of local) {
    merged.set(item.inventoryItemId, item); // local overwrites server for same SKU
  }
  return Array.from(merged.values());
}

export function formatPrice(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}

// --- Support / Chat API ---

export async function createConversation(subject: string): Promise<ConversationDto> {
  return apiPost<ConversationDto>('/api/v1/support/conversations', { subject });
}

export async function getConversations(): Promise<ConversationDto[]> {
  return apiGet<ConversationDto[]>('/api/v1/support/conversations');
}

export async function getConversation(id: string): Promise<ConversationDto> {
  return apiGet<ConversationDto>(`/api/v1/support/conversations/${id}`);
}

export async function getMessages(conversationId: string): Promise<MessageDto[]> {
  return apiGet<MessageDto[]>(`/api/v1/support/conversations/${conversationId}/messages`);
}

export async function rateConversation(
  conversationId: string,
  stars: number,
  comment: string,
): Promise<void> {
  await apiPost<void>(`/api/v1/support/conversations/${conversationId}/rate`, {
    stars,
    comment,
  });
}

export async function uploadAttachment(
  conversationId: string,
  file: File,
): Promise<AttachmentDto> {
  const token = getStoredToken();
  if (!token) {
    window.location.replace('/login');
    throw new Error('Not authenticated');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    `${API_BASE_URL}/api/v1/support/conversations/${conversationId}/attachments`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    },
  );

  if (!response.ok) {
    const text = await response.text();
    let userMessage = `Upload failed with status ${response.status}`;
    try {
      const json = JSON.parse(text) as { message?: string | string[] };
      if (json.message) {
        userMessage = Array.isArray(json.message) ? json.message.join('; ') : json.message;
      }
    } catch {
      if (text) userMessage = text;
    }
    throw new Error(userMessage);
  }

  return response.json() as Promise<AttachmentDto>;
}

export async function sendMessage(
  conversationId: string,
  content: string,
): Promise<MessageDto> {
  return apiPost<MessageDto>(`/api/v1/support/conversations/${conversationId}/messages`, {
    content,
  });
}

// --- Coupon ---

export type { CouponValidationDto };

export async function validateCoupon(
  code: string,
  orderAmount: number,
): Promise<CouponValidationDto> {
  return apiGet<CouponValidationDto>(
    `/api/v1/coupons/validate?code=${encodeURIComponent(code)}&orderAmount=${orderAmount}`,
  );
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
