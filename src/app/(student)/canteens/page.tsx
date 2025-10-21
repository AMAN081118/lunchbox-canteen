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
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Star, Clock, TrendingUp, Search } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function CanteensPage() {
  const { user } = useAuthContext();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch canteens
  const { data: canteens, isLoading } = useQuery({
    queryKey: ["canteens"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("canteens")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const filteredCanteens = canteens?.filter((canteen) =>
    canteen.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <ProtectedRoute redirectTo="/login">
      <MainLayout>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-600 to-accent-orange text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 animate-fade-in">
              Choose Your Canteen
            </h1>
            <p className="text-lg text-white/90 mb-6 animate-slide-up">
              Order delicious food from your favorite campus canteens
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search canteens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 bg-white text-gray-900 border-0 shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Canteens Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-72" />
              ))}
            </div>
          ) : filteredCanteens && filteredCanteens.length > 0 ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {searchQuery
                    ? `Search Results (${filteredCanteens.length})`
                    : "All Canteens"}
                </h2>
                <p className="text-gray-600 mt-1">
                  Select a canteen to browse their menu
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCanteens.map((canteen) => (
                  <Card
                    key={canteen.id}
                    className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden animate-slide-up"
                    onClick={() => router.push(`/menu/${canteen.id}`)}
                  >
                    {/* Image/Icon Section */}
                    <div className="relative h-48 bg-gradient-to-br from-primary-400 via-primary-500 to-accent-orange overflow-hidden">
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-8xl group-hover:scale-110 transition-transform duration-300">
                          🍽️
                        </span>
                      </div>
                      {/* Trending Badge */}
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-accent-yellow text-gray-900 font-semibold">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl group-hover:text-primary-600 transition-colors">
                        {canteen.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <MapPin className="h-4 w-4" />
                        Campus Location
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-3">
                        {/* Rating */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-lg">
                            <Star className="h-4 w-4 fill-accent-yellow text-accent-yellow" />
                            <span className="font-bold text-sm">4.5</span>
                          </div>
                          <span className="text-sm text-gray-600">
                            (200+ ratings)
                          </span>
                        </div>

                        {/* Info Row */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>15-20 mins</span>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            Open Now
                          </Badge>
                        </div>

                        {/* CTA Button */}
                        <Button
                          className="w-full mt-2 bg-primary-600 hover:bg-primary-700 group-hover:bg-primary-700"
                          onClick={() => router.push(`/menu/${canteen.id}`)}
                        >
                          View Menu
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No canteens found</h3>
              <p className="text-gray-600">
                {searchQuery
                  ? "Try a different search term"
                  : "No active canteens at the moment"}
              </p>
            </div>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
