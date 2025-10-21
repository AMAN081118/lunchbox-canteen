// src/app/search/page.tsx
"use client";

import { MainLayout } from "@/components/layout/main-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Plus, Minus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabase/client";
import { useCartStore } from "@/store/cart-store";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const canteenId = searchParams.get("canteen");
  const { addItem, updateQuantity, getItemQuantity } = useCartStore();

  const [searchQuery, setSearchQuery] = useState(query);

  // Search canteens: Only runs when "All Canteens" is effectively selected (no canteenId in URL)
  const { data: canteens, isLoading: loadingCanteens } = useQuery({
    queryKey: ["search-canteens", query, canteenId],
    queryFn: async () => {
      if (!query) return [];
      const { data, error } = await supabaseClient
        .from("canteens")
        .select("*")
        .textSearch("name", query, { type: "websearch" });

      if (error) throw error;
      return data;
    },
    enabled: !!query && !canteenId, // Only runs if there's a query and no specific canteen is chosen
  });

  // Search menu items: Always runs with a query, but filters by canteen if one is selected
  const { data: menuItems, isLoading: loadingItems } = useQuery({
    queryKey: ["search-items", query, canteenId],
    queryFn: async () => {
      if (!query) return [];

      let queryBuilder = supabaseClient
        .from("menu_items")
        .select("*, canteens(id, name)")
        .textSearch("name", query, { type: "websearch" });

      if (canteenId) {
        queryBuilder = queryBuilder.eq("canteen_id", canteenId);
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;
      return data;
    },
    enabled: !!query,
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const isLoading = loadingCanteens || loadingItems;
  const hasResults =
    (canteens && canteens.length > 0) || (menuItems && menuItems.length > 0);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm p-2 flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search for dishes or canteens..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10 border-0"
                  />
                </div>
                <Button onClick={handleSearch} className="bg-primary-600">
                  Search
                </Button>
              </div>
            </div>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Searching...</p>
            </div>
          ) : hasResults ? (
            <>
              {/* Canteens Results */}
              {canteens && canteens.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-4">
                    Canteens ({canteens.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {canteens.map((canteen) => (
                      <Card
                        key={canteen.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => router.push(`/menu/${canteen.id}`)}
                      >
                        <CardHeader>
                          <CardTitle>{canteen.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Campus Location
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Menu Items Results */}
              {menuItems && menuItems.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">
                    Dishes ({menuItems.length})
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {menuItems.map((item) => {
                      const quantity = getItemQuantity(item.id);

                      return (
                        <Card
                          key={item.id}
                          className="hover:shadow-lg transition-shadow overflow-hidden"
                        >
                          <div
                            className="relative h-32 bg-gray-100 flex items-center justify-center text-4xl cursor-pointer"
                            onClick={() => router.push(`/dish/${item.id}`)}
                          >
                            {item.veg ? "🥗" : "🍗"}
                            <Badge
                              className={`absolute top-2 left-2 ${
                                item.veg
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {item.veg ? "Veg" : "Non-Veg"}
                            </Badge>
                          </div>
                          <CardContent className="p-3">
                            <h3
                              className="font-semibold text-sm mb-1 line-clamp-1 cursor-pointer hover:text-primary-600"
                              onClick={() => router.push(`/dish/${item.id}`)}
                            >
                              {item.name}
                            </h3>
                            <p className="text-xs text-gray-500 mb-2">
                              {item.canteens?.name}
                            </p>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-lg font-bold text-primary-600">
                                ₹{item.price_inr}
                              </p>
                            </div>

                            {/* Add to Cart Controls */}
                            {quantity > 0 ? (
                              <div className="flex items-center justify-center gap-2 bg-gray-100 rounded-lg p-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() =>
                                    updateQuantity(item.id, quantity - 1)
                                  }
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="font-bold w-6 text-center">
                                  {quantity}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() =>
                                    updateQuantity(item.id, quantity + 1)
                                  }
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                className="w-full bg-primary-600 hover:bg-primary-700"
                                onClick={() =>
                                  addItem({
                                    id: item.id,
                                    name: item.name,
                                    price: parseFloat(
                                      item.price_inr.toString(),
                                    ),
                                    canteenId: item.canteen_id,
                                    canteenName: item.canteens?.name || "",
                                    veg: item.veg,
                                  })
                                }
                              >
                                Add
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : searchQuery ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No results found</h3>
              <p className="text-gray-600">
                Try searching with different keywords
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold mb-2">
                Search for your favorite food
              </h3>
              <p className="text-gray-600">
                Enter a dish name or canteen to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
