"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, X } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function FloatingCart() {
  const router = useRouter();
  const { items, getTotalItems, getTotalPrice } = useCartStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  // Group items by canteen
  const itemsByCanteen = items.reduce((acc, item) => {
    if (!acc[item.canteenId]) {
      acc[item.canteenId] = {
        canteenName: item.canteenName,
        items: [],
        total: 0,
      };
    }
    acc[item.canteenId].items.push(item);
    acc[item.canteenId].total += item.price * item.quantity;
    return acc;
  }, {} as Record<string, { canteenName: string; items: typeof items; total: number }>);

  // Don't show if cart is empty
  if (totalItems === 0) return null;

  return (
    <>
      {/* Expanded View */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Floating Cart */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 transition-all duration-300",
          isExpanded ? "w-96" : "w-auto",
        )}
      >
        {isExpanded ? (
          <Card className="shadow-2xl animate-slide-up">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Your Cart</h3>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Items by Canteen */}
              <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                {Object.entries(itemsByCanteen).map(([canteenId, data]) => (
                  <div key={canteenId} className="border rounded-lg p-3">
                    <h4 className="font-semibold text-sm mb-2">
                      {data.canteenName}
                    </h4>
                    <div className="space-y-2">
                      {data.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-600">
                            {item.name} × {item.quantity}
                          </span>
                          <span className="font-medium">
                            ₹{(item.price * item.quantity).toFixed(0)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t mt-2 pt-2 flex justify-between text-sm font-semibold">
                      <span>Subtotal</span>
                      <span>₹{data.total.toFixed(0)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 mb-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary-600">
                    ₹{totalPrice.toFixed(0)}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => router.push("/cart")}
                className="w-full bg-primary-600 hover:bg-primary-700"
              >
                View Full Cart
              </Button>
            </div>
          </Card>
        ) : (
          <Button
            onClick={() => setIsExpanded(true)}
            className="h-14 px-6 bg-primary-600 hover:bg-primary-700 shadow-2xl rounded-full flex items-center gap-3 group"
          >
            <ShoppingCart className="h-5 w-5" />
            <div className="text-left">
              <div className="text-xs opacity-90">{totalItems} items</div>
              <div className="font-bold">₹{totalPrice.toFixed(0)}</div>
            </div>
            <Badge className="ml-2 bg-white text-primary-600 group-hover:bg-gray-100">
              {totalItems}
            </Badge>
          </Button>
        )}
      </div>
    </>
  );
}
