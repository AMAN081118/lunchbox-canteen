"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Clock, Plus, Minus, MapPin } from "lucide-react";
import { useCartStore } from "@/store/cart-store";

export default function DishDetailPage() {
  const router = useRouter();
  const params = useParams();
  const dishId = params.dishId as string;
  const { addItem, updateQuantity, getItemQuantity } = useCartStore();

  // Fetch dish details
  const { data: dish, isLoading } = useQuery({
    queryKey: ["dish", dishId],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("menu_items")
        .select(
          `
          *,
          canteens (
            id,
            name
          )
        `,
        )
        .eq("id", dishId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // ✅ FIXED: Fetch feedback for this menu item from order_items
  const { data: feedback } = useQuery({
    queryKey: ["feedback", dishId],
    queryFn: async () => {
      // First get order_items for this menu item
      const { data: orderItems, error: orderItemsError } = await supabaseClient
        .from("order_items")
        .select("id")
        .eq("menu_item_id", dishId);

      if (orderItemsError || !orderItems) return [];

      const orderItemIds = orderItems.map((item) => item.id);
      if (orderItemIds.length === 0) return [];

      // Then get feedback for those order items
      const { data: feedbackData, error: feedbackError } = await supabaseClient
        .from("feedback")
        .select(
          `
          *,
          profiles:profile_id (
            full_name
          )
        `,
        )
        .in("order_item_id", orderItemIds)
        .order("created_at", { ascending: false });

      if (feedbackError) return [];
      return feedbackData;
    },
  });

  const quantity = dish ? getItemQuantity(dish.id) : 0;

  const handleAddToCart = () => {
    if (!dish) return;
    addItem({
      id: dish.id,
      name: dish.name,
      price: parseFloat(dish.price_inr.toString()), // ✅ FIXED: Convert to string then parse
      canteenId: dish.canteen_id,
      canteenName: dish.canteens?.name || "",
      veg: dish.veg,
    });
  };

  const handleIncrement = () => {
    if (!dish) return;
    updateQuantity(dish.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (!dish) return;
    updateQuantity(dish.id, quantity - 1);
  };

  const avgRating =
    feedback && feedback.length > 0
      ? (
          feedback.reduce((sum, f) => sum + (f.rating || 0), 0) /
          feedback.length
        ).toFixed(1)
      : "N/A";

  if (isLoading) {
    return (
      <ProtectedRoute redirectTo="/login">
        <MainLayout>
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Skeleton className="h-96 mb-6" />
            <Skeleton className="h-48" />
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  if (!dish) {
    return (
      <ProtectedRoute redirectTo="/login">
        <MainLayout>
          <div className="max-w-4xl mx-auto px-4 py-8 text-center">
            <p className="text-gray-600">Dish not found</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute redirectTo="/login">
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Dish Card */}
          <Card className="overflow-hidden border-0 shadow-xl mb-6 animate-slide-up">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Image Section */}
              <div className="relative h-64 md:h-full bg-gradient-to-br from-primary-400 to-accent-orange flex items-center justify-center">
                <span className="text-9xl">{dish.veg ? "🥗" : "🍗"}</span>
                {dish.veg && (
                  <Badge className="absolute top-4 left-4 bg-green-100 text-green-800">
                    Vegetarian
                  </Badge>
                )}
              </div>

              {/* Details Section */}
              <div className="p-6">
                <div className="mb-4">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {dish.name}
                  </h1>
                  <button
                    onClick={() => router.push(`/menu/${dish.canteen_id}`)}
                    className="flex items-center gap-2 text-primary-600 hover:underline"
                  >
                    <MapPin className="h-4 w-4" />
                    {dish.canteens?.name}
                  </button>
                </div>

                {dish.description && (
                  <p className="text-gray-600 mb-4">{dish.description}</p>
                )}

                {/* Rating */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1 bg-green-100 px-3 py-1 rounded-lg">
                    <Star className="h-5 w-5 fill-accent-yellow text-accent-yellow" />
                    <span className="font-bold">{avgRating}</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    ({feedback?.length || 0} ratings)
                  </span>
                </div>

                {/* Info */}
                {dish.prep_time_minutes && (
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <Clock className="h-5 w-5" />
                    <span>Prep time: {dish.prep_time_minutes} minutes</span>
                  </div>
                )}

                {/* Price & Add to Cart */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-3xl font-bold text-primary-600">
                        ₹{dish.price_inr}
                      </p>
                      <p className="text-sm text-gray-500">per serving</p>
                    </div>
                  </div>

                  {quantity > 0 ? (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-3 flex-1 justify-center bg-gray-100 rounded-xl p-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleDecrement}
                          className="h-10 w-10"
                        >
                          <Minus className="h-5 w-5" />
                        </Button>
                        <span className="text-xl font-bold w-12 text-center">
                          {quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleIncrement}
                          className="h-10 w-10"
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>
                      <Button
                        onClick={() => router.push("/cart")}
                        className="bg-primary-600 hover:bg-primary-700"
                      >
                        View Cart
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={handleAddToCart}
                      disabled={!dish.available}
                      className="w-full h-14 text-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                    >
                      {dish.available ? (
                        <>
                          <Plus className="h-5 w-5 mr-2" />
                          Add to Cart
                        </>
                      ) : (
                        "Currently Unavailable"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Reviews Section */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {feedback && feedback.length > 0 ? (
                <div className="space-y-4">
                  {feedback.map((review) => (
                    <div
                      key={review.id}
                      className="border-b pb-4 last:border-0"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= (review.rating || 0)
                                  ? "fill-accent-yellow text-accent-yellow"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">
                          {review.profiles?.full_name || "Anonymous"}
                        </span>
                      </div>
                      {/* ✅ FIXED: Use 'comment' instead of 'comments' */}
                      {review.comment && (
                        <p className="text-sm text-gray-600">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600 py-8">
                  No reviews yet. Be the first to review!
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
