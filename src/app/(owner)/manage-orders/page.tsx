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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";

type OrderStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "in_preparation"
  | "ready_for_pickup"
  | "completed"
  | "cancelled";

export default function OwnerOrdersPage() {
  const { user, signOut } = useAuthContext();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Check profile role
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch owner's canteen
  const { data: canteenOwner } = useQuery({
    queryKey: ["canteen-owner", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");

      console.log("Fetching canteen owner for user:", user.id);

      const { data, error } = await supabaseClient
        .from("canteen_owners")
        .select("*, canteens(*)")
        .eq("owner_profile_id", user.id)
        .single();

      if (error) {
        console.error("Canteen owner fetch error:", error);
        throw error;
      }

      console.log("Canteen owner:", data);
      return data;
    },
    enabled: !!user?.id && profile?.role === "owner",
  });

  // ✅ FIXED: Fetch orders with separate profile lookup
  const {
    data: orders,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["owner-orders", canteenOwner?.canteen_id],
    queryFn: async () => {
      if (!canteenOwner?.canteen_id) return [];

      console.log("Fetching orders for canteen:", canteenOwner.canteen_id);

      const { data, error } = await supabaseClient
        .from("orders")
        .select("*, order_items(*)")
        .eq("canteen_id", canteenOwner.canteen_id)
        .order("placed_at", { ascending: false });

      if (error) {
        console.error("Orders fetch error:", error);
        throw error;
      }

      console.log("Orders fetched:", data);

      // Fetch user profiles separately
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map((o) => o.user_id))];

        const { data: profiles, error: profileError } = await supabaseClient
          .from("profiles")
          .select("id, full_name, phone")
          .in("id", userIds);

        if (profileError) {
          console.error("Profiles fetch error:", profileError);
        } else {
          console.log("Profiles fetched:", profiles);
        }

        // Map profiles to orders
        const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
        return data.map((order) => ({
          ...order,
          profiles: profileMap.get(order.user_id) || null,
        }));
      }

      return data || [];
    },
    enabled: !!canteenOwner?.canteen_id,
  });

  // Debug log errors
  useEffect(() => {
    if (error) {
      console.error("Query error:", error);
    }
  }, [error]);

  // Real-time subscription
  useEffect(() => {
    if (!canteenOwner?.canteen_id) return;

    const channel = supabaseClient
      .channel("owner-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `canteen_id=eq.${canteenOwner.canteen_id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["owner-orders"] });
        },
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [canteenOwner?.canteen_id, queryClient]);

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: OrderStatus;
    }) => {
      const { error } = await supabaseClient
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-orders"] });
    },
  });

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "in_preparation":
        return "bg-purple-100 text-purple-800";
      case "ready_for_pickup":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  if (profile && profile.role !== "owner") {
    return (
      <ProtectedRoute redirectTo="/login">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                Only canteen owners can access this page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/canteens")}>
                Go to Student Portal
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
                  onClick={() => router.push("/dashboard")}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">
                  Manage Orders
                </h1>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Debug Info */}
          {error && (
            <Card className="mb-4 border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-800 font-semibold">
                  Error loading orders:
                </p>
                <p className="text-sm text-red-600">
                  {(error as Error).message}
                </p>
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          Order #{order.id.slice(0, 8)}
                        </CardTitle>
                        <CardDescription>
                          {order.profiles?.full_name || "Unknown"} •{" "}
                          {order.profiles?.phone || "N/A"}
                        </CardDescription>
                        <CardDescription>
                          {new Date(order.placed_at).toLocaleString("en-IN")}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getStatusColor(order.status)}>
                          {formatStatus(order.status)}
                        </Badge>
                        <p className="text-lg font-bold">
                          ₹{order.total_price_inr}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Order Items */}
                    <div className="mb-4 space-y-1">
                      <p className="font-semibold text-sm text-gray-700">
                        Items:
                      </p>
                      {order.order_items?.map((item: any) => (
                        <p key={item.id} className="text-sm text-gray-600">
                          {item.name} × {item.quantity} = ₹
                          {item.total_price_inr}
                        </p>
                      ))}
                    </div>

                    {order.notes && (
                      <div className="mb-4 p-2 bg-gray-50 rounded">
                        <p className="text-sm font-semibold text-gray-700">
                          Notes:
                        </p>
                        <p className="text-sm text-gray-600">{order.notes}</p>
                      </div>
                    )}

                    {/* Status Update */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">
                        Update Status:
                      </label>
                      <Select
                        value={order.status}
                        onValueChange={(value) =>
                          updateStatusMutation.mutate({
                            orderId: order.id,
                            status: value as OrderStatus,
                          })
                        }
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="in_preparation">
                            In Preparation
                          </SelectItem>
                          <SelectItem value="ready_for_pickup">
                            Ready for Pickup
                          </SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600">No orders yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Canteen ID: {canteenOwner?.canteen_id?.slice(0, 8)}
                </p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
