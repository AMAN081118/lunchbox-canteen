"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuthContext } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MapPin, Phone, User } from "lucide-react";
import { useEffect } from "react";
import { OrderTimeline } from "@/components/orders/order-timeline";

export default function OrderDetailPage() {
  const { user, signOut } = useAuthContext();
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;

  // Fetch order details
  const {
    data: order,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("orders")
        .select(
          `
          *,
          canteens (
            id,
            name
          ),
          order_items (
            id,
            name,
            unit_price_inr,
            quantity,
            total_price_inr
          )
        `,
        )
        .eq("id", orderId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Real-time subscription for order updates
  useEffect(() => {
    const channel = supabaseClient
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          console.log("Order updated:", payload);
          refetch();

          // Show browser notification if permission granted
          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            const newStatus = (payload.new as any).status;
            const statusMessages: Record<string, string> = {
              accepted: "Your order has been confirmed! 🎉",
              in_preparation: "Your food is being prepared 👨‍🍳",
              ready_for_pickup: "Your order is ready for pickup! 🎉",
              completed: "Thank you! Order completed ✅",
              rejected: "Order was rejected. Please contact canteen.",
              cancelled: "Order was cancelled.",
            };

            new Notification("Order Update", {
              body: statusMessages[newStatus] || "Order status updated",
              icon: "/favicon.ico",
              badge: "/favicon.ico",
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [orderId, refetch]);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

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
                  onClick={() => router.push("/orders")}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Order Details
                  </h1>
                  {order && (
                    <p className="text-sm text-gray-600">
                      Order #{order.id.slice(0, 8)}
                    </p>
                  )}
                </div>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-96" />
              <Skeleton className="h-48" />
            </div>
          ) : order ? (
            <div className="space-y-6">
              {/* Order Timeline */}
              <OrderTimeline
                status={order.status}
                createdAt={order.placed_at}
              />

              {/* Canteen Info */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        {order.canteens?.name}
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Campus Location
                      </CardDescription>
                    </div>
                    <Badge
                      className={
                        order.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : order.status === "ready_for_pickup"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "rejected" ||
                            order.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {order.status
                        .split("_")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ")}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                  <CardDescription>
                    Placed on{" "}
                    {new Date(order.placed_at).toLocaleString("en-IN")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.order_items?.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex justify-between py-2 border-b last:border-0"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            ₹{item.unit_price_inr} × {item.quantity}
                          </p>
                        </div>
                        <p className="font-bold">₹{item.total_price_inr}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t mt-4 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>₹{order.total_price_inr}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Taxes & Fees</span>
                      <span>₹0.00</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total</span>
                      <span>₹{order.total_price_inr}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment & Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-medium">{order.payment_method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status</span>
                    <Badge
                      variant={
                        order.payment_status === "paid"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {order.payment_status}
                    </Badge>
                  </div>
                  {order.notes && (
                    <div className="pt-2 border-t">
                      <span className="text-gray-600 block mb-1">
                        Your Notes
                      </span>
                      <p className="text-sm bg-gray-50 p-3 rounded-lg">
                        {order.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Ready for Pickup Alert */}
              {order.status === "ready_for_pickup" && (
                <Card className="border-2 border-green-500 bg-green-50 animate-pulse">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-5xl mb-3">🎉</div>
                      <p className="text-xl font-bold text-green-800 mb-2">
                        Your order is ready!
                      </p>
                      <p className="text-green-700">
                        Please collect your order from {order.canteens?.name}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600">Order not found</p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
