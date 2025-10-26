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
import { ArrowLeft, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { OrderTimeline } from "@/components/orders/order-timeline";
import { FeedbackModal } from "@/components/orders/feedback-modal";

interface Canteen {
  id: string;
  name: string;
}

interface OrderItem {
  id: string;
  name: string;
  unit_price_inr: number;
  quantity: number;
  total_price_inr: number;
  menu_item_id: string;
}

interface Order {
  id: string;
  user_id: string;
  canteen_id: string;
  status:
    | "pending"
    | "accepted"
    | "in_preparation"
    | "ready_for_pickup"
    | "completed"
    | "rejected"
    | "cancelled";
  total_price_inr: number;
  payment_method: string;
  payment_status: "paid" | "unpaid";
  placed_at: string;
  notes?: string;
  canteens?: Canteen;
  order_items?: OrderItem[];
}

export default function OrderDetailPage() {
  const { user, signOut } = useAuthContext();
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Fetch order details
  const {
    data: order,
    isLoading,
    refetch,
  } = useQuery<Order>({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("orders")
        .select(
          `
    id,
    user_id,
    canteen_id,
    backup_menu_item_id,
    total_price_inr,
    payment_method,
    payment_status,
    placed_at,
    scheduled_for,
    updated_at,
    status,
    notes,
    canteens ( id, name ),
    order_items (
      id,
      name,
      menu_item_id,
      unit_price_inr,
      quantity,
      total_price_inr
    )
  `,
        )
        .eq("id", orderId)
        .single();

      if (error) throw error;
      return data as Order;
    },
  });

  // FIXED: Check localStorage AND database for feedback submission
  useEffect(() => {
    const checkFeedback = async () => {
      if (!order?.order_items) return;

      // Check localStorage first (instant check)
      const localStorageKey = `feedback_submitted_${orderId}`;
      const localFeedbackSubmitted =
        localStorage.getItem(localStorageKey) === "true";

      if (localFeedbackSubmitted) {
        setFeedbackSubmitted(true);
        return;
      }

      const orderItemIds = order.order_items.map((item: OrderItem) => item.id);
      const { data: existingFeedback } = await supabaseClient
        .from("feedback")
        .select("id")
        .in("order_item_id", orderItemIds);

      if (existingFeedback && existingFeedback.length > 0) {
        setFeedbackSubmitted(true);
        localStorage.setItem(localStorageKey, "true");
      }
    };

    if (order?.status === "completed") {
      checkFeedback();
    }
  }, [order, orderId]);

  // FIXED: Only show modal once when order first becomes completed
  useEffect(() => {
    if (!order || !user) return;

    // Only show if order is completed AND feedback not submitted AND modal not already shown
    if (order.status === "completed" && !feedbackSubmitted) {
      // Check if we've already shown the modal for this order in this session
      const sessionKey = `feedback_modal_shown_${orderId}`;
      const alreadyShownInSession =
        sessionStorage.getItem(sessionKey) === "true";

      if (!alreadyShownInSession && !showFeedbackModal) {
        // Small delay for better UX
        const timer = setTimeout(() => {
          setShowFeedbackModal(true);
          // Mark as shown in this session
          sessionStorage.setItem(sessionKey, "true");
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [
    order,
    order?.status,
    feedbackSubmitted,
    showFeedbackModal,
    orderId,
    user,
  ]);

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
            const newStatus = (payload.new as { status: Order["status"] })
              .status;

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
  }, [order, orderId, refetch]);

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

  // ✅ FIXED: Mark feedback as submitted in localStorage when closed
  const handleFeedbackClose = () => {
    setShowFeedbackModal(false);
    setFeedbackSubmitted(true);
    // Save to localStorage to persist across page reloads
    localStorage.setItem(`feedback_submitted_${orderId}`, "true");
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
                <CardHeader className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        {order.canteens?.name}
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        IIITDMJ
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
                <CardHeader className="p-4">
                  <CardTitle>Order Items</CardTitle>
                  <CardDescription>
                    Placed on{" "}
                    {new Date(order.placed_at).toLocaleString("en-IN")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.order_items?.map((item: OrderItem) => (
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
                <CardHeader className="p-4">
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

              {/* Feedback Button (if completed and submitted) */}
              {order.status === "completed" && feedbackSubmitted && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6 text-center">
                    <p className="text-blue-800 font-semibold mb-2">
                      ✅ Feedback Submitted
                    </p>
                    <p className="text-sm text-blue-600">
                      Thank you for sharing your experience!
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Manual Feedback Button */}
              {order.status === "completed" && !feedbackSubmitted && (
                <Button
                  onClick={() => setShowFeedbackModal(true)}
                  className="w-full bg-primary-600 hover:bg-primary-700"
                >
                  Rate Your Order
                </Button>
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

        {/* Feedback Modal */}
        {order && (
          <FeedbackModal
            isOpen={showFeedbackModal}
            onClose={handleFeedbackClose}
            orderId={order.id}
            orderItems={order.order_items || []}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
