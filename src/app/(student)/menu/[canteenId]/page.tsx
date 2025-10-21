"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuthContext } from "@/contexts/auth-context";
import { AlertCircle, Info, CheckCircle, AlertTriangle } from "lucide-react";
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
import { ArrowLeft, ShoppingCart, Plus, Minus } from "lucide-react";
import { useCartStore } from "@/store/cart-store";

export default function MenuPage() {
  const { user, signOut } = useAuthContext();
  const router = useRouter();
  const params = useParams();
  const canteenId = params.canteenId as string;

  // Use Zustand cart store
  const { addItem, updateQuantity, getItemQuantity, getTotalItems } =
    useCartStore();

  // Fetch canteen details
  const { data: canteen } = useQuery({
    queryKey: ["canteen", canteenId],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("canteens")
        .select("*")
        .eq("id", canteenId)
        .single();

      if (error) throw error;
      return data;
    },
  });
  // Fetch announcements
  const { data: announcements } = useQuery({
    queryKey: ["announcements", canteenId],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("announcements")
        .select("*")
        .eq("canteen_id", canteenId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case "info":
        return <Info className="h-5 w-5" />;
      case "success":
        return <CheckCircle className="h-5 w-5" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5" />;
      case "error":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getAnnouncementClass = (type: string) => {
    switch (type) {
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  // Fetch menu items
  const { data: menuItems, isLoading } = useQuery({
    queryKey: ["menu", canteenId],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("menu_items")
        .select("*")
        .eq("canteen_id", canteenId)
        .eq("available", true)
        .order("category")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const handleAddToCart = (item: any) => {
    addItem({
      id: item.id,
      name: item.name,
      price: parseFloat(item.price_inr),
      canteenId: canteenId,
      canteenName: canteen?.name || "",
      veg: item.veg,
      image_path: item.image_path,
    });
  };

  const handleIncrement = (itemId: string) => {
    const currentQty = getItemQuantity(itemId);
    updateQuantity(itemId, currentQty + 1);
  };

  const handleDecrement = (itemId: string) => {
    const currentQty = getItemQuantity(itemId);
    updateQuantity(itemId, currentQty - 1);
  };

  const cartItemsCount = getTotalItems();

  // Group items by category
  const itemsByCategory = menuItems?.reduce((acc, item) => {
    const category = item.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

  return (
    <ProtectedRoute redirectTo="/login">
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/canteens")}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {canteen?.name || "Menu"}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {menuItems?.length || 0} items available
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="default"
                  onClick={() => router.push("/cart")}
                  className="relative"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Cart
                  {cartItemsCount > 0 && (
                    <Badge className="ml-2 bg-red-500">{cartItemsCount}</Badge>
                  )}
                </Button>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Announcements Section */}
          {announcements && announcements.length > 0 && (
            <div className="mb-6 space-y-3 animate-slide-up">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className={`p-4 rounded-lg border-2 flex items-start gap-3 ${getAnnouncementClass(
                    announcement.type,
                  )}`}
                >
                  {getAnnouncementIcon(announcement.type)}
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{announcement.title}</h4>
                    <p className="text-sm">{announcement.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {isLoading && (
            <div className="space-y-8">
              {[1, 2].map((i) => (
                <div key={i}>
                  <Skeleton className="h-8 w-48 mb-4" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((j) => (
                      <Skeleton key={j} className="h-48" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {itemsByCategory &&
            Object.keys(itemsByCategory).map((category) => (
              <div key={category} className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">
                  {category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {itemsByCategory[category].map((item) => {
                    const quantity = getItemQuantity(item.id);

                    return (
                      <Card
                        key={item.id}
                        className="hover:shadow-md transition"
                      >
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="text-lg">
                                {item.name}
                              </CardTitle>
                              {item.description && (
                                <CardDescription className="mt-1">
                                  {item.description}
                                </CardDescription>
                              )}
                            </div>
                            {item.veg && (
                              <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-800 ml-2"
                              >
                                Veg
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold text-gray-900">
                                ₹{item.price_inr}
                              </p>
                              {item.prep_time_minutes && (
                                <p className="text-sm text-gray-500">
                                  {item.prep_time_minutes} mins
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {quantity > 0 ? (
                                <>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleDecrement(item.id)}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-8 text-center font-semibold">
                                    {quantity}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleIncrement(item.id)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <Button onClick={() => handleAddToCart(item)}>
                                  Add
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}

          {!isLoading && (!menuItems || menuItems.length === 0) && (
            <div className="text-center py-12">
              <p className="text-gray-600">No menu items available.</p>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
