"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuthContext } from "@/contexts/auth-context";
import { AlertCircle, Info, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ShoppingCart, Plus, Minus } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import Image from "next/image";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price_inr: number;
  image_path: string | null;
  veg: boolean;
}
import { fullUrl } from "@/lib/supabase/bucket";
import Loader from "@/app/Loader";

export default function MenuPage() {
  const { signOut } = useAuthContext();
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
  // const [showLoader, setShowLoader] = useState(true);

  // useEffect(() => {
  //   if (!isLoading) {
  //     const timer = setTimeout(() => setShowLoader(false), 500); // wait for fade-out
  //     return () => clearTimeout(timer);
  //   }
  // }, [isLoading]);
  if (isLoading) {
    return <Loader />; // shows your translucent glassy loader on top
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price_inr,
      canteenId: canteenId,
      canteenName: canteen?.name || "",
      veg: item.veg,
      image_path: item.image_path || undefined,
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
                  onClick={() => router.push("/cart")}
                  className="relative bg-red-500"
                >
                  <ShoppingCart className="h-5 w-5 sm:mr-2" />
                  <span className="hidden sm:block">Cart</span>
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
                      <div
                        key={item.id}
                        className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] flex flex-col group"
                      >
                        {/* 1. Image with Badge */}
                        <div className="relative  w-full h-40">
                          <Image
                            src={
                              item.image_path
                                ? `${fullUrl}${item.image_path}`
                                : `https://placehold.co/400x300?text=${item.name}`
                            }
                            alt={item.name}
                            className="w-full h-40 object-cover"
                            fill
                            priority={false}
                          />

                          {/* Using Badge style and logic from example 1 */}
                          <Badge
                            className={`absolute top-2 left-2 ${
                              item.veg
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-red-100 text-red-800 border-red-200"
                            }`}
                          >
                            {item.veg ? "Veg" : "Non-Veg"}
                          </Badge>
                        </div>

                        {/* 2. Content Layout with flex-grow */}
                        <div className="p-4 flex flex-col grow">
                          {/* Title */}
                          <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 text-2xl">
                            {item.name}
                          </h3>

                          {/* Description (from example 2) */}
                          {item.description && (
                            <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                              {item.description}
                            </p>
                          )}

                          {/* 3. Bottom section (pushed down) */}
                          <div className="mt-auto flex items-center justify-between">
                            {/* Left Side: Price + Prep Time */}
                            <div>
                              <span className="text-xl font-bold text-gray-800">
                                ₹{item.price_inr}
                              </span>
                              {item.prep_time_minutes && (
                                <p className="text-sm text-gray-500 mt-0.5">
                                  <span>Time:</span> {item.prep_time_minutes}{" "}
                                  mins
                                </p>
                              )}
                            </div>

                            {/* Right Side: Add/Remove Buttons (from example 2) */}
                            <div className="flex items-center gap-2">
                              {quantity > 0 ? (
                                <>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-full"
                                    onClick={() => handleDecrement(item.id)}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-6 text-center font-semibold">
                                    {quantity}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-full"
                                    onClick={() => handleIncrement(item.id)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  onClick={() => handleAddToCart(item)}
                                  className="rounded-full px-5 py-2 text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white"
                                >
                                  Add
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
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
