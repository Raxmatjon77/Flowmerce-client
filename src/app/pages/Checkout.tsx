import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Trash2, ArrowRight, CheckCircle, Tag, X } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  customerApi,
  getCart,
  removeFromCart,
  clearCart,
  clearServerCart,
  formatPrice,
  validateCoupon,
  CartItem,
} from '../../lib/customer-api';
import type { CouponValidationDto } from '../../types/coupon';
import { getStoredUserId } from '../../lib/auth';

type Step = 1 | 2 | 'confirmed';

export function Checkout() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [cart, setCart] = useState<CartItem[]>(getCart);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Shipping form
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationDto | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const subtotal = cart.reduce((sum, c) => sum + c.unitPrice * c.quantity, 0);
  const discountAmount = appliedCoupon?.discountAmount ?? 0;
  const total = subtotal - discountAmount;

  function handleRemove(inventoryItemId: string) {
    const updated = removeFromCart(inventoryItemId);
    setCart(updated);
    // Reset coupon when cart changes (total changes)
    setAppliedCoupon(null);
    setCouponError(null);
  }

  async function handleApplyCoupon() {
    const code = couponInput.trim();
    if (!code) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const result = await validateCoupon(code, subtotal);
      setAppliedCoupon(result);
      toast.success(`Coupon "${result.couponCode}" applied — saving ${formatPrice(result.discountAmount)}!`);
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : 'Invalid coupon code.');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError(null);
  }

  async function handlePlaceOrder() {
    if (!street || !city || !state || !zipCode || !country) {
      setSubmitError('All shipping fields are required.');
      return;
    }

    const customerId = getStoredUserId();
    if (!customerId) {
      setSubmitError('Could not determine your user ID. Please log in again.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const order = await customerApi.placeOrder({
        customerId,
        items: cart.map((c) => ({
          productId: c.inventoryItemId,
          productName: c.productName,
          quantity: c.quantity,
          unitPrice: c.unitPrice,
          currency: 'USD',
        })),
        shippingAddress: { street, city, state, zipCode, country },
        couponCode: appliedCoupon?.couponCode ?? null,
      });
      clearCart();
      void clearServerCart();
      setCart([]);
      setConfirmedOrderId(order.id);
      setStep('confirmed');
      toast.success('Order placed successfully!');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to place order.');
    } finally {
      setSubmitting(false);
    }
  }

  // Step: confirmed
  if (step === 'confirmed') {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <Card className="border-white/10 bg-slate-900/50 p-8 text-center backdrop-blur-sm">
          <CheckCircle className="mx-auto h-16 w-16 text-green-400" />
          <h1 className="mt-4 text-2xl font-bold text-white">Order Placed!</h1>
          <p className="mt-2 text-gray-400">Your order has been successfully placed.</p>
          {confirmedOrderId && (
            <p className="mt-3 font-mono text-sm text-purple-400">{confirmedOrderId}</p>
          )}
          <Button
            className="mt-6 bg-gradient-to-r from-purple-500 to-blue-500"
            onClick={() => void navigate('/orders')}
          >
            View My Orders
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Checkout</h1>
        <p className="mt-1 text-gray-400">
          {step === 1 ? 'Review your cart' : 'Enter shipping details'}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 text-sm">
        <span className={`rounded-full px-3 py-1 font-medium ${step === 1 ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-400'}`}>
          1. Cart Review
        </span>
        <ArrowRight className="h-4 w-4 text-gray-600" />
        <span className={`rounded-full px-3 py-1 font-medium ${step === 2 ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-400'}`}>
          2. Shipping
        </span>
      </div>

      {/* Step 1: Cart review */}
      {step === 1 && (
        <div className="space-y-4">
          {cart.length === 0 ? (
            <Card className="border-white/10 bg-slate-900/50 p-8 text-center backdrop-blur-sm">
              <p className="text-white">Your cart is empty.</p>
              <Button asChild className="mt-4 bg-gradient-to-r from-purple-500 to-blue-500">
                <Link to="/shop">Browse Shop</Link>
              </Button>
            </Card>
          ) : (
            <>
              <Card className="border-white/10 bg-slate-900/50 backdrop-blur-sm">
                <div className="divide-y divide-white/10">
                  {cart.map((item) => (
                    <div key={item.inventoryItemId} className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium text-white">{item.productName}</p>
                        <p className="text-xs text-gray-500 font-mono">{item.sku}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                          <p className="font-medium text-white">{formatPrice(item.unitPrice * item.quantity)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => handleRemove(item.inventoryItemId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Coupon input */}
              <Card className="border-white/10 bg-slate-900/50 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-medium text-white">Coupon Code</span>
                </div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2">
                    <span className="text-sm text-green-400 font-medium">
                      ✅ {appliedCoupon.couponCode} — −{formatPrice(appliedCoupon.discountAmount)} applied
                    </span>
                    <button onClick={handleRemoveCoupon} className="text-gray-400 hover:text-white ml-2">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => { if (e.key === 'Enter') void handleApplyCoupon(); }}
                      placeholder="Enter code (e.g. SAVE20)"
                      className="border-white/10 bg-white/5 text-white placeholder:text-gray-500 font-mono uppercase"
                    />
                    <Button
                      variant="outline"
                      className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 shrink-0"
                      disabled={couponLoading || !couponInput.trim()}
                      onClick={() => void handleApplyCoupon()}
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </Button>
                  </div>
                )}
                {couponError && (
                  <p className="mt-1.5 text-xs text-red-400">{couponError}</p>
                )}
              </Card>

              {/* Order summary */}
              <Card className="border-white/10 bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">Subtotal</p>
                  <p className="text-white">{formatPrice(subtotal)}</p>
                </div>
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-green-400">Discount ({appliedCoupon?.couponCode})</p>
                    <p className="text-green-400">−{formatPrice(discountAmount)}</p>
                  </div>
                )}
                <div className="border-t border-white/10 pt-2 flex items-center justify-between">
                  <p className="font-semibold text-white">Total</p>
                  <p className="text-xl font-bold text-white">{formatPrice(total)}</p>
                </div>
              </Card>

              <Button
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500"
                disabled={cart.length === 0}
                onClick={() => setStep(2)}
              >
                Continue to Shipping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      )}

      {/* Step 2: Shipping address */}
      {step === 2 && (
        <div className="space-y-4">
          <Card className="border-white/10 bg-slate-900/50 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-lg font-semibold text-white">Shipping Address</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street" className="text-gray-300">Street</Label>
                <Input
                  id="street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="123 Main St"
                  className="border-white/10 bg-white/5 text-white placeholder:text-gray-500"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-gray-300">City</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New York"
                    className="border-white/10 bg-white/5 text-white placeholder:text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-gray-300">State</Label>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="NY"
                    className="border-white/10 bg-white/5 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="zipCode" className="text-gray-300">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="10001"
                    className="border-white/10 bg-white/5 text-white placeholder:text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-gray-300">Country</Label>
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="US"
                    className="border-white/10 bg-white/5 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>
            </div>
          </Card>

          {submitError && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {submitError}
            </p>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-white/10"
              onClick={() => setStep(1)}
              disabled={submitting}
            >
              Back
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500"
              disabled={submitting}
              onClick={() => void handlePlaceOrder()}
            >
              {submitting ? 'Placing Order...' : `Place Order · ${formatPrice(total)}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
