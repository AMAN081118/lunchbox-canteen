"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { MainLayout } from "@/components/layout/main-layout";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { supabaseClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useState } from "react";
import { CanteenCard } from "@/components/canteen/CanteenCard"; // Ensure this is imported

export default function CanteensPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: canteens, isLoading } = useQuery({
    queryKey: ["canteens"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("canteens")
        .select(
          `
    id,
    name,
    img_url,
    is_active,
    total_sales,
    gst_no,
    created_at,
    based_hostel_id,
    rating,
    hostels:based_hostel_id (
      id,
      name
    )
  `,
        )
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
        {/* Simplified Hero Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Choose Your Canteen
            </h1>
            <p className="text-gray-600 mb-6">
              Select a canteen to browse their menu and place an order.
            </p>
            <div className="max-w-md relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search for a canteen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Canteens Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-5 border">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCanteens && filteredCanteens.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCanteens.map((canteen) => (
                <CanteenCard key={canteen.id} canteen={canteen} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No canteens found</h3>
              <p className="text-gray-600">
                {searchQuery
                  ? "Try a different search term."
                  : "No active canteens are available at the moment."}
              </p>
            </div>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
