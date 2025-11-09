"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabaseClient } from "@/lib/supabase/client";
import { useMealPlan } from "@/hooks/useMealPlan";
import { useQuery } from "@tanstack/react-query";
import type { Database } from "@/types/database.types";

type MenuItem = Database["public"]["Tables"]["menu_items"]["Row"];
type MenuItemWithCanteen = MenuItem & { canteens?: { name: string } };

interface MealPlannerSetupProps {
  userId: string;
  onMealPlanCreated: () => void;
}

export default function MealPlannerSetup({
  userId,
  onMealPlanCreated,
}: MealPlannerSetupProps) {
  const [step, setStep] = useState<"input" | "select">("input");
  const [dailyBudget, setDailyBudget] = useState<number | "">(300);
  const [dailyCalories, setDailyCalories] = useState<number | "">(2000);
  const [duration, setDuration] = useState<number>(14);
  const [selectedDishes, setSelectedDishes] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const { createMealPlan } = useMealPlan(userId);

  // Fetch all available dishes
  const { data: availableDishes = [] } = useQuery<MenuItemWithCanteen[]>({
    queryKey: ["available-dishes"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("menu_items")
        .select("id, name, price_inr, calories, canteens(name)")
        .eq("available", true)
        .order("name");

      if (error) throw error;
      return (data as MenuItemWithCanteen[]) || [];
    },
  });

  const toggleDish = (dishId: string) => {
    const newSelected = new Set(selectedDishes);
    if (newSelected.has(dishId)) {
      newSelected.delete(dishId);
    } else {
      newSelected.add(dishId);
    }
    setSelectedDishes(newSelected);
  };

  const handleCreate = async () => {
    if (!dailyBudget || !dailyCalories || selectedDishes.size < 2) return;

    setIsLoading(true);
    try {
      await createMealPlan.mutateAsync({
        dailyBudget: Number(dailyBudget),
        dailyCalories: Number(dailyCalories),
        durationDays: duration,
        allowedDishIds: Array.from(selectedDishes),
      });
      onMealPlanCreated();
      setStep("input");
      setSelectedDishes(new Set());
    } catch (error) {
      console.error("Failed to create meal plan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Meal Plan</CardTitle>
      </CardHeader>
      <CardContent>
        {step === "input" ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="budget" className="text-sm">
                Daily Budget (₹)
              </Label>
              <Input
                id="budget"
                type="number"
                min="50"
                step="10"
                value={dailyBudget}
                onChange={(e) =>
                  setDailyBudget(e.target.value ? Number(e.target.value) : "")
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="calories" className="text-sm">
                Daily Calorie Limit
              </Label>
              <Input
                id="calories"
                type="number"
                min="1000"
                step="100"
                value={dailyCalories}
                onChange={(e) =>
                  setDailyCalories(e.target.value ? Number(e.target.value) : "")
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="duration" className="text-sm">
                Duration (days)
              </Label>
              <Input
                id="duration"
                type="number"
                min="3"
                max="30"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">{duration} days</p>
            </div>

            <Button
              onClick={() => setStep("select")}
              disabled={!dailyBudget || !dailyCalories}
              className="w-full"
            >
              Next: Select Dishes
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-3">
                Select dishes to build your meal plan (minimum 2)
              </p>
              <div className="space-y-2 max-h-72 overflow-y-auto border rounded-lg p-3">
                {availableDishes.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-8">
                    No dishes available
                  </p>
                ) : (
                  availableDishes.map((dish) => (
                    <button
                      key={dish.id}
                      onClick={() => toggleDish(dish.id)}
                      className={`w-full text-left p-3 rounded border-2 transition ${
                        selectedDishes.has(dish.id)
                          ? "border-primary-600 bg-primary-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">
                            {dish.name}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            ₹{dish.price_inr} | {dish.calories ?? 0} cal
                          </p>
                        </div>
                        {selectedDishes.has(dish.id) && (
                          <Badge className="ml-2 bg-primary-600 shrink-0">
                            OK
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setStep("input")}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleCreate}
                disabled={selectedDishes.size < 2 || isLoading}
                className="flex-1"
              >
                {isLoading ? "Creating..." : "Create Plan"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
