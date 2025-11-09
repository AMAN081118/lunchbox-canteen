"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuthContext } from "@/contexts/auth-context";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileForm from "@/components/profile/ProfileForm";
import OrderAnalytics from "@/components/profile/OrderAnalytics";
import MealPlannerSetup from "@/components/profile/MealPlannerSetup";
import MealPlanCalendar from "@/components/profile/MealPlanCalendar";
import type { Database } from "@/types/database.types";

type UserProfile = Database["public"]["Tables"]["profiles"]["Row"];

export default function ProfilePage() {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState("profile");

  const { data: profile, refetch } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      const { data, error } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data as UserProfile;
    },
    enabled: !!user?.id,
  });

  const { data: mealPlan } = useQuery({
    queryKey: ["meal-plan", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabaseClient
        .from("meal_plans")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  return (
    <ProtectedRoute redirectTo="/login">
      <div className="min-h-screen bg-gray-50 py-6 px-2 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
            My Profile
          </h1>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="flex flex-col gap-1 w-full sm:grid sm:grid-cols-3 sm:gap-0 sm:space-y-0 space-y-2 pb-2">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="mealplan">
                Meal Plan
                {mealPlan && (
                  <span className="ml-2 h-2 w-2 bg-primary-600 rounded-full" />
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              {profile && (
                <ProfileForm profile={profile} refetchProfile={refetch} />
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              {user?.id && <OrderAnalytics userId={user.id} />}
            </TabsContent>

            <TabsContent value="mealplan" className="space-y-6">
              {user?.id && !mealPlan && (
                <MealPlannerSetup
                  userId={user.id}
                  onMealPlanCreated={() => {
                    setActiveTab("mealplan");
                  }}
                />
              )}
              {user?.id && mealPlan && <MealPlanCalendar userId={user.id} />}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}
