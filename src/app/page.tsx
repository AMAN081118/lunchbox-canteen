"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { DishCard } from "@/components/menu/DishCard";
import { Clock, Utensils, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabase/client";
import Offers from "@/components/offer/offers-s";
import { CanteenCard } from "@/components/canteen/CanteenCard";
import { TopSearchBar } from "@/components/layout/TopSearchBar";

export default function LandingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCanteen, setSelectedCanteen] = useState("all");
  // Fetch popular canteens
  const { data: canteens } = useQuery({
    queryKey: ["popular-canteens"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("canteens")
        .select(
          `
    id,
    name,
    img_url,
    hostels:based_hostel_id (
      id,
      name
    )
  `,
        )
        .eq("is_active", true)
        .limit(6);

      if (error) throw error;
      return data;
    },
  });
  const handleSearch = () => {
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.set("q", searchQuery);
      if (selectedCanteen !== "all") {
        params.set("canteen", selectedCanteen);
      }
      router.push(`/search?${params.toString()}`);
    }
  };

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
        .order("times_ordered", { ascending: false })
        .limit(8);

      if (error) throw error;
      return data;
    },
  });

  return (
    <MainLayout>
      <TopSearchBar
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSearch={handleSearch}
        canteens={canteens || []}
        selectedCanteen={selectedCanteen}
        onCanteenChange={setSelectedCanteen}
      />
      <Offers />
      {/* Hero Section */}
      <section className="hidden relative bg-food-gradient text-white overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Order from Any
              <br />
              <span className="text-accent-yellow">Canteen</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Don&apos;t wait in Line... Order from your favorite canteens.
            </p>

            {/* Search Bar */}
            {/* <HeroSearchBar
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              onSearch={handleSearch}
              canteens={canteens || []}
              selectedCanteen={selectedCanteen}
              onCanteenChange={setSelectedCanteen}
            /> */}
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
      <section className="hidden py-16 bg-white">
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
      {/* Trending Dishes */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Trending Dishes
            </h2>
            <p className="text-gray-600">Most ordered items this week</p>
          </div>

          {/* 2. Update Grid for better spacing & use the new DishCard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {popularItems?.slice(0, 8).map((item) => (
              <DishCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>
      {/* Popular Canteens */}
      <section className="py-8">
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

          {/* 2. Use the new CanteenCard in the grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {canteens?.map((canteen) => (
              <CanteenCard key={canteen.id} canteen={canteen} />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Button onClick={() => router.push("/canteens")}>
              View All Canteens
            </Button>
          </div>
        </div>
      </section>
      ; ;{/* CTA Section */}
      <section className="hidden py-20 bg-linear-to-r from-primary-600 to-accent-orange text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 ">
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
              className="border-2 border-white text-primary-600 hover:bg-white/10 font-semibold px-8"
            >
              Browse Canteens
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
