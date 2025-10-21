"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Clock,
  MapPin,
  Star,
  TrendingUp,
  Utensils,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabase/client";
import Image from "next/image";

export default function LandingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch popular canteens
  const { data: canteens } = useQuery({
    queryKey: ["popular-canteens"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("canteens")
        .select("*")
        .eq("is_active", true)
        .limit(6);

      if (error) throw error;
      return data;
    },
  });

  // Fetch popular menu items
  const { data: popularItems } = useQuery({
    queryKey: ["popular-items"],
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
        .eq("available", true)
        .limit(8);

      if (error) throw error;
      return data;
    },
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative bg-food-gradient text-white overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Delicious Food from Your
              <br />
              <span className="text-accent-yellow">Campus Canteens</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Order from your favorite hostel canteens. Quick, easy, and
              hassle-free meal ordering for students.
            </p>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search for dishes or canteens..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-12 h-14 border-0 text-gray-900 placeholder:text-gray-500 focus-visible:ring-0"
                  />
                </div>
                <Button
                  size="lg"
                  onClick={handleSearch}
                  className="h-14 px-8 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl"
                >
                  Search
                </Button>
              </div>

              {/* Quick Categories */}
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {["Breakfast", "Lunch", "Snacks", "Dinner", "Beverages"].map(
                  (category) => (
                    <Badge
                      key={category}
                      variant="secondary"
                      className="bg-white/20 hover:bg-white/30 text-white border-0 cursor-pointer px-4 py-2 text-sm backdrop-blur-sm transition-all"
                      onClick={() =>
                        router.push(
                          `/canteens?category=${category.toLowerCase()}`,
                        )
                      }
                    >
                      {category}
                    </Badge>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-600">
                Order in seconds and get your food quickly
              </p>
            </div>

            <div className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-accent-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="h-8 w-8 text-accent-green" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Wide Selection</h3>
              <p className="text-gray-600">
                Choose from multiple campus canteens
              </p>
            </div>

            <div className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-accent-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-accent-orange" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Orders</h3>
              <p className="text-gray-600">
                Real-time updates on your order status
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Canteens */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Popular Canteens
              </h2>
              <p className="text-gray-600">Browse canteens loved by students</p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/canteens")}
              className="hidden md:flex"
            >
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {canteens?.map((canteen) => (
              <Card
                key={canteen.id}
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 overflow-hidden"
                onClick={() => router.push(`/menu/${canteen.id}`)}
              >
                <div className="relative h-48 bg-gradient-to-br from-primary-400 to-accent-orange">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl">🍽️</span>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="group-hover:text-primary-600 transition-colors">
                    {canteen.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Campus Location
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-accent-yellow text-accent-yellow" />
                      <span className="font-semibold">4.5</span>
                      <span className="text-sm text-gray-500">(200+)</span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      Open Now
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Button onClick={() => router.push("/canteens")}>
              View All Canteens
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Dishes */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Trending Dishes
            </h2>
            <p className="text-gray-600">Most ordered items this week</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {popularItems?.slice(0, 8).map((item) => (
              <Card
                key={item.id}
                className="group cursor-pointer hover:shadow-lg transition-all border-0 overflow-hidden"
                onClick={() => router.push(`/menu/${item.canteen_id}`)}
              >
                <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200">
                  <div className="absolute inset-0 flex items-center justify-center text-5xl">
                    {item.veg ? "🥗" : "🍗"}
                  </div>
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
                  <h3 className="font-semibold text-sm mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                    {item.canteens?.name}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary-600">
                      ₹{item.price_inr}
                    </span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-gray-500">Popular</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-r from-primary-600 to-accent-orange text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Order?
          </h2>
          <p className="text-lg md:text-xl mb-8 text-white/90">
            Join thousands of students ordering delicious meals from campus
            canteens
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push("/signup")}
              className="bg-white text-primary-600 hover:bg-gray-100 font-semibold px-8"
            >
              Sign Up Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/canteens")}
              className="border-2 border-white text-white hover:bg-white/10 font-semibold px-8"
            >
              Browse Canteens
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
