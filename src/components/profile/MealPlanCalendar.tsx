"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMealPlan } from "@/hooks/useMealPlan";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type MenuItem = Database["public"]["Tables"]["menu_items"]["Row"];
type MenuItemWithCanteen = MenuItem & { canteens?: { name: string } };

interface MealPlanCalendarProps {
  userId: string;
  onMealPlanDeleted?: () => void;
}

export default function MealPlanCalendar({
  userId,
  onMealPlanDeleted,
}: MealPlanCalendarProps) {
  const {
    mealPlan,
    mealPlanItems,
    toggleMealCompletion,
    deleteMealPlan,
    createMealPlan,
  } = useMealPlan(userId);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [isRegenLoading, setIsRegenLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch menu items for display
  const { data: menuItems = [] } = useQuery<MenuItemWithCanteen[]>({
    queryKey: ["menu-items-map", mealPlanItems],
    queryFn: async () => {
      if (!mealPlanItems || mealPlanItems.length === 0) return [];

      const dishIds = [
        ...new Set(mealPlanItems.map((item) => item.menu_item_id)),
      ];
      const { data, error } = await supabaseClient
        .from("menu_items")
        .select(
          "id, name, price_inr, calories, available, avg_rating, canteen_id, category, created_at, description, image_path, max_per_order, prep_time_minutes, rating_count, serving_size, times_ordered, veg, canteens(name)",
        )
        .in("id", dishIds);

      if (error) throw error;

      return (data as MenuItemWithCanteen[]) || [];
    },
    enabled: !!mealPlanItems,
  });

  const menuItemsMap = Object.fromEntries(menuItems.map((i) => [i.id, i]));

  if (!mealPlan || !mealPlanItems) {
    return null;
  }

  const startDate = new Date(mealPlan.start_date);
  const selectedDate = new Date(startDate);
  selectedDate.setDate(selectedDate.getDate() + selectedDay - 1);

  const daysInPlan =
    Math.ceil(
      (new Date(mealPlan.end_date).getTime() -
        new Date(mealPlan.start_date).getTime()) /
        (1000 * 60 * 60 * 24),
    ) + 1;

  const selectedDayMeals = mealPlanItems.filter(
    (item) => item.day_number === selectedDay,
  );

  const dayCompletion = selectedDayMeals.every((item) => item.completed);

  const handleRegenerate = async () => {
    setIsRegenLoading(true);
    try {
      const { data: allowed } = await supabaseClient
        .from("meal_plan_allowed_dishes")
        .select("menu_item_id")
        .eq("meal_plan_id", mealPlan.id);

      if (allowed) {
        await createMealPlan.mutateAsync({
          dailyBudget: mealPlan.daily_budget_inr,
          dailyCalories: mealPlan.daily_calorie_limit,
          durationDays: daysInPlan,
          allowedDishIds: allowed.map((a) => a.menu_item_id),
        });
      }
    } catch (error) {
      console.error("Failed to regenerate:", error);
    } finally {
      setIsRegenLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMealPlan.mutateAsync();
      setShowDeleteConfirm(false);
      onMealPlanDeleted?.();
    } catch (error) {
      console.error("Failed to delete:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Meal Plan Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">
                  Day {selectedDay} of {daysInPlan}
                </span>
                <span className="text-sm text-gray-600">
                  {selectedDate.toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all"
                  style={{ width: `${(selectedDay / daysInPlan) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-between text-xs">
              <span className="text-gray-600">
                {mealPlanItems.filter((i) => i.completed).length} meals
                completed
              </span>
              <span className="font-medium">
                {Math.round(
                  (mealPlanItems.filter((i) => i.completed).length /
                    (daysInPlan * 2)) *
                    100,
                )}
                %
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day Navigation */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-gray-600">Select Day</p>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: daysInPlan }).map((_, idx) => {
            const day = idx + 1;
            const dayMeals = mealPlanItems.filter(
              (item) => item.day_number === day,
            );
            const completed = dayMeals.every((m) => m.completed);

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`p-2 rounded text-xs font-medium transition ${
                  selectedDay === day
                    ? "bg-primary-600 text-white"
                    : completed
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Meals */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">
            {dayCompletion ? "All meals completed" : `Day ${selectedDay} Meals`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {selectedDayMeals.map((mealItem) => {
            const dish = menuItemsMap[mealItem.menu_item_id];
            return (
              <div
                key={mealItem.id}
                className="flex items-start gap-3 p-3 border rounded-lg"
              >
                <button
                  onClick={() => toggleMealCompletion.mutate(mealItem.id)}
                  className={`mt-1 h-5 w-5 rounded border-2 shrink-0 flex items-center justify-center transition ${
                    mealItem.completed
                      ? "bg-primary-600 border-primary-600 text-white"
                      : "border-gray-300 hover:border-primary-600"
                  }`}
                >
                  {mealItem.completed && (
                    <span className="text-xs font-bold">✓</span>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge className="text-xs bg-gray-200 text-gray-800">
                      {mealItem.meal_type === "lunch" ? "Lunch" : "Dinner"}
                    </Badge>
                  </div>
                  <p
                    className={`font-medium text-sm truncate ${
                      mealItem.completed ? "line-through text-gray-500" : ""
                    }`}
                  >
                    {dish?.name || "Loading..."}
                  </p>
                  <p className="text-xs text-gray-600">
                    {dish && (
                      <>
                        ₹{dish.price_inr} | {dish.calories} cal |{" "}
                        {dish.canteens?.name}
                      </>
                    )}
                  </p>
                </div>

                {mealItem.completed && (
                  <span className="text-xs text-primary-600 font-medium whitespace-nowrap">
                    Done
                  </span>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-col sm:flex-row">
        <Button
          onClick={handleRegenerate}
          variant="outline"
          className="flex-1"
          disabled={isRegenLoading}
        >
          {isRegenLoading ? "Regenerating..." : "Regenerate"}
        </Button>
        <Button
          onClick={() => setShowDeleteConfirm(true)}
          variant="destructive"
          className="flex-1"
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete Plan"}
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-900 text-base">
              Delete Meal Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-red-800">
              Are you sure you want to delete this meal plan? This action cannot
              be undone.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
