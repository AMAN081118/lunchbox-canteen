"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuthContext } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart-store";
import { supabaseClient } from "@/lib/supabase/client";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function CheckoutPage() {
  const { user, signOut } = useAuthContext();
  const router = useRouter();
  const { items, clearCart, getTotalPrice } = useCartStore();

  const [paymentMethod, setPaymentMethod] = useState<"COD" | "razorpay">("COD");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPrice = getTotalPrice();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      setError("Your cart is empty");
      return;
    }

    if (!user) {
      setError("You must be logged in to place an order");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get the canteen ID from the first item (all items should be from same canteen)
      const canteenId = items[0].canteenId;

      // Verify all items are from the same canteen
      const allSameCanteen = items.every(
        (item) => item.canteenId === canteenId,
      );
      if (!allSameCanteen) {
        setError("All items must be from the same canteen");
        setLoading(false);
        return;
      }

      // Create the order
      const { data: order, error: orderError } = await supabaseClient
        .from("orders")
        .insert({
          user_id: user.id,
          canteen_id: canteenId,
          status: "pending",
          total_price_inr: totalPrice,
          payment_method: paymentMethod,
          payment_status: paymentMethod === "COD" ? "unpaid" : "pending",
          notes: notes || null,
          placed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        menu_item_id: item.id,
        name: item.name,
        unit_price_inr: item.price,
        quantity: item.quantity,
        total_price_inr: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabaseClient
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart after successful order
      clearCart();

      // Redirect to order confirmation
      router.push(`/orders/${order.id}`);
    } catch (err: any) {
      console.error("Order placement error:", err);
      setError(err.message || "Failed to place order. Please try again.");
      setLoading(false);
    }
  };

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <ProtectedRoute redirectTo="/login">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Cart is Empty</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Your cart is empty. Add some items before checking out.
              </p>
              <Button onClick={() => router.push("/canteens")}>
                Browse Canteens
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute redirectTo="/login">
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/cart")}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) =>
                      setPaymentMethod(value as "COD" | "razorpay")
                    }
                  >
                    <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="COD" id="cod" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer">
                        <div className="font-semibold">Cash on Delivery</div>
                        <div className="text-sm text-gray-600">
                          Pay when you collect your order
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 opacity-50">
                      <RadioGroupItem value="razorpay" id="razorpay" disabled />
                      <Label
                        htmlFor="razorpay"
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-semibold">
                          Online Payment (Coming Soon)
                        </div>
                        <div className="text-sm text-gray-600">
                          Pay via UPI, Cards, Net Banking
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Order Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Notes (Optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Any special instructions? (e.g., extra spicy, no onions)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </CardContent>
              </Card>

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                  {error}
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Items List */}
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-600">
                            {item.name} × {item.quantity}
                          </span>
                          <span className="font-medium">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>₹{totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Taxes & Fees</span>
                        <span>₹0.00</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>₹{totalPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handlePlaceOrder}
                      disabled={loading}
                    >
                      {loading ? "Placing Order..." : "Place Order"}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      By placing your order, you agree to our terms and
                      conditions
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
