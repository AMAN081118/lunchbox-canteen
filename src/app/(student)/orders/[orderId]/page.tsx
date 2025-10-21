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
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Package,
  Utensils,
  XCircle,
} from "lucide-react";
import { useEffect } from "react";

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
        () => {
          refetch();
        },
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [orderId, refetch]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  // ✅ FIXED: Updated status values to match database enum
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          icon: Clock,
          color: "bg-yellow-100 text-yellow-800",
          label: "Pending",
        };
      case "accepted":
        return {
          icon: CheckCircle2,
          color: "bg-blue-100 text-blue-800",
          label: "Accepted",
        };
      case "rejected":
        return {
          icon: XCircle,
          color: "bg-red-100 text-red-800",
          label: "Rejected",
        };
      case "in_preparation":
        return {
          icon: Utensils,
          color: "bg-purple-100 text-purple-800",
          label: "In Preparation",
        };
      case "ready_for_pickup":
        return {
          icon: Package,
          color: "bg-green-100 text-green-800",
          label: "Ready for Pickup",
        };
      case "completed":
        return {
          icon: CheckCircle2,
          color: "bg-green-100 text-green-800",
          label: "Completed",
        };
      case "cancelled":
        return {
          icon: XCircle,
          color: "bg-red-100 text-red-800",
          label: "Cancelled",
        };
      default:
        return {
          icon: Clock,
          color: "bg-gray-100 text-gray-800",
          label: "Unknown",
        };
    }
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
              <Skeleton className="h-48" />
              <Skeleton className="h-64" />
            </div>
          ) : order ? (
            <div className="space-y-6">
              {/* Order Status */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Order Status</CardTitle>
                    <Badge className={getStatusInfo(order.status).color}>
                      {getStatusInfo(order.status).label}
                    </Badge>
                  </div>
                  <CardDescription>
                    Placed on{" "}
                    {new Date(order.placed_at).toLocaleString("en-IN")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Canteen</span>
                      <span className="font-medium">
                        {order.canteens?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method</span>
                      <span className="font-medium">
                        {order.payment_method}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status</span>
                      <span className="font-medium capitalize">
                        {order.payment_status}
                      </span>
                    </div>
                    {order.notes && (
                      <div className="pt-2 border-t">
                        <span className="text-gray-600 block mb-1">Notes</span>
                        <span className="text-sm">{order.notes}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
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

                  <div className="border-t mt-4 pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>₹{order.total_price_inr}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions - ✅ FIXED: Updated status check */}
              {order.status === "ready_for_pickup" && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-6">
                    <p className="text-center text-green-800 font-semibold mb-4">
                      🎉 Your order is ready for pickup!
                    </p>
                    <p className="text-center text-sm text-green-700">
                      Please collect your order from {order.canteens?.name}
                    </p>
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
