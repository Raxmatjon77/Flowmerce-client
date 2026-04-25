import { useState } from 'react';
import { Link } from 'react-router';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState';
import { customerApi, addToCart, getCart, formatPrice } from '../../lib/customer-api';
import { useApiData } from '../../lib/use-api';

export function Shop() {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [cartCount, setCartCount] = useState(getCart().length);

  const { data, loading, error, reload } = useApiData(
    () => customerApi.listInventory({ limit: 50 }),
    [],
  );

  const items = data?.data ?? [];

  function getQty(itemId: string, max: number) {
    return Math.min(quantities[itemId] ?? 1, max);
  }

  function setQty(itemId: string, value: number, max: number) {
    setQuantities((prev) => ({ ...prev, [itemId]: Math.max(1, Math.min(value, max)) }));
  }

  function handleAddToCart(item: { id: string; sku: string; productName: string; availableQuantity: number; unitPrice: number }) {
    const qty = getQty(item.id, item.availableQuantity);
    addToCart({
      inventoryItemId: item.id,
      sku: item.sku,
      productName: item.productName,
      quantity: qty,
      unitPrice: item.unitPrice,
    });
    setCartCount(getCart().length);
    toast.success(`Added ${qty}x ${item.productName} to cart`);
  }

  const cartTotal = getCart().reduce((sum, c) => sum + c.unitPrice * c.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Shop</h1>
          <p className="mt-1 text-gray-400">Browse available products and add them to your cart.</p>
        </div>
        {cartCount > 0 && (
          <Link
            to="/shop/checkout"
            className="flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm text-purple-300 hover:bg-purple-500/20"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>{cartCount} item{cartCount !== 1 ? 's' : ''}</span>
            <span className="text-purple-400">·</span>
            <span>{formatPrice(cartTotal)}</span>
          </Link>
        )}
      </div>

      {loading ? <LoadingState label="Loading products..." /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}
      {!loading && !error && items.length === 0 ? (
        <EmptyState title="No products available" description="Check back soon." />
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const outOfStock = item.availableQuantity === 0;
            const qty = getQty(item.id, item.availableQuantity);

            return (
              <Card
                key={item.id}
                className={`relative border-white/10 bg-slate-900/50 p-6 backdrop-blur-sm ${outOfStock ? 'opacity-60' : ''}`}
              >
                {outOfStock && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 z-10">
                    <span className="rounded-full bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-300 border border-red-500/30">
                      Out of Stock
                    </span>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-white">{item.productName}</h3>
                      <p className="text-xs text-gray-500 font-mono">{item.sku}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        item.availableQuantity > 10
                          ? 'border-green-500/30 bg-green-500/10 text-green-300'
                          : item.availableQuantity > 0
                          ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300'
                          : 'border-red-500/30 bg-red-500/10 text-red-300'
                      }
                    >
                      {item.availableQuantity} in stock
                    </Badge>
                  </div>

                  <p className="text-2xl font-bold text-white">{formatPrice(item.unitPrice)}</p>

                  {!outOfStock && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setQty(item.id, qty - 1, item.availableQuantity)}
                          disabled={qty <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm text-white">{qty}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setQty(item.id, qty + 1, item.availableQuantity)}
                          disabled={qty >= item.availableQuantity}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                        onClick={() => handleAddToCart(item)}
                      >
                        <ShoppingCart className="mr-1 h-4 w-4" />
                        Add to Cart
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
