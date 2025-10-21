"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuthContext } from "@/contexts/auth-context";
import { RoleSwitcher } from "@/components/layout/role-switcher";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Store, Package, TrendingUp, Clock } from "lucide-react";

export default function OwnerDashboardPage() {
  const { user, signOut } = useAuthContext();
  const router = useRouter();

  // ✅ FIXED: Check user profile role first
  const { data: profile, isLoading: loadingProfile } = useQuery({
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

  // ✅ FIXED: Fetch owner's canteen (only if role is owner)
  const { data: canteenOwner, isLoading: loadingOwner } = useQuery({
    queryKey: ["canteen-owner", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabaseClient
        .from("canteen_owners")
        .select(
          `
          *,
          canteens (
            id,
            name,
            total_sales
          )
        `,
        )
        .eq("owner_profile_id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && profile?.role === "owner",
  });

  // Fetch orders statistics
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["owner-stats", canteenOwner?.canteen_id],
    queryFn: async () => {
      if (!canteenOwner?.canteen_id) return null;

      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch orders
      const { data: orders, error } = await supabaseClient
        .from("orders")
        .select("*")
        .eq("canteen_id", canteenOwner.canteen_id);

      if (error) throw error;

      // Calculate stats
      const totalOrders = orders?.length || 0;
      const todayOrders =
        orders?.filter((o) => new Date(o.placed_at) >= today).length || 0;
      const pendingOrders =
        orders?.filter((o) => o.status === "pending").length || 0;
      const todayRevenue =
        orders
          ?.filter((o) => new Date(o.placed_at) >= today)
          .reduce(
            (sum, o) => sum + parseFloat(o.total_price_inr.toString()),
            0,
          ) || 0;

      return {
        totalOrders,
        todayOrders,
        pendingOrders,
        todayRevenue,
      };
    },
    enabled: !!canteenOwner?.canteen_id,
  });

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  // ✅ FIXED: Check role from profiles table
  if (!loadingProfile && profile?.role !== "owner") {
    return (
      <ProtectedRoute redirectTo="/login">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You are not registered as a canteen owner. Your current role is:{" "}
                <strong>{profile?.role || "unknown"}</strong>
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

  // ✅ FIXED: Check if owner has a canteen assigned
  if (!loadingOwner && !canteenOwner && profile?.role === "owner") {
    return (
      <ProtectedRoute redirectTo="/login">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>No Canteen Assigned</CardTitle>
              <CardDescription>
                You are registered as an owner but no canteen is assigned to
                your account. Please contact the administrator.
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
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Owner Dashboard
                </h1>
                {canteenOwner && (
                  <p className="text-sm text-gray-600">
                    {canteenOwner.canteens?.name}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{user?.email}</span>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {loadingProfile || loadingOwner || loadingStats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Today's Orders</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold">
                        {stats?.todayOrders || 0}
                      </div>
                      <Package className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Pending Orders</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold">
                        {stats?.pendingOrders || 0}
                      </div>
                      <Clock className="h-8 w-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Today's Revenue</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold">
                        ₹{stats?.todayRevenue?.toFixed(0) || 0}
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Orders</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold">
                        {stats?.totalOrders || 0}
                      </div>
                      <Store className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card
                  className="cursor-pointer hover:shadow-lg transition"
                  onClick={() => router.push("/manage-orders")}
                >
                  <CardHeader>
                    <CardTitle>Manage Orders</CardTitle>
                    <CardDescription>
                      View and update order status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">View Orders</Button>
                  </CardContent>
                </Card>
                <Card
                  className="cursor-pointer hover:shadow-lg transition"
                  onClick={() => router.push("/menu-management")}
                >
                  <CardHeader>
                    <CardTitle>Menu Management</CardTitle>
                    <CardDescription>
                      Add, edit, or remove menu items
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">Manage Menu</Button>
                  </CardContent>
                </Card>
                {/* <Card
                  className="cursor-pointer hover:shadow-lg transition"
                  onClick={() => router.push("/analytics")}
                >
                  <CardHeader>
                    <CardTitle>Analytics</CardTitle>
                    <CardDescription>
                      View sales and performance metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">View Analytics</Button>
                  </CardContent>
                </Card> */}
                <Card
                  className="cursor-pointer hover:shadow-lg transition"
                  onClick={() => router.push("/settings")}
                >
                  <CardHeader>
                    <CardTitle>Canteen Settings</CardTitle>
                    <CardDescription>
                      Update canteen info and post announcements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">Manage Settings</Button>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </main>
        {/* Role Switcher */}
        {profile && (
          <RoleSwitcher currentRole="owner" userRole={profile.role} />
        )}
      </div>
    </ProtectedRoute>
  );
}
