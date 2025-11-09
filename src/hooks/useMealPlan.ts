import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type MealPlan = Database["public"]["Tables"]["meal_plans"]["Row"];
type MealPlanItem = Database["public"]["Tables"]["meal_plan_items"]["Row"];
type MenuItem = Database["public"]["Tables"]["menu_items"]["Row"];

type MenuItemForSelection = Pick<
  MenuItem,
  "id" | "price_inr" | "calories" | "avg_rating"
>;

export const useMealPlan = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  // Fetch current meal plan
  const { data: mealPlan, isLoading } = useQuery({
    queryKey: ["meal-plan", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabaseClient
        .from("meal_plans")
        .select("*")
        .eq("user_id", userId)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data as MealPlan | null;
    },
    enabled: !!userId,
  });

  // Fetch meal plan items
  const { data: mealPlanItems } = useQuery({
    queryKey: ["meal-plan-items", mealPlan?.id],
    queryFn: async () => {
      if (!mealPlan?.id) return [];
      const { data, error } = await supabaseClient
        .from("meal_plan_items")
        .select("*")
        .eq("meal_plan_id", mealPlan.id)
        .order("day_number");
      if (error) throw error;
      return data as MealPlanItem[];
    },
    enabled: !!mealPlan?.id,
  });

  // Create/Regenerate meal plan
  const createMealPlan = useMutation({
    mutationFn: async (params: {
      dailyBudget: number;
      dailyCalories: number;
      durationDays: number;
      allowedDishIds: string[];
    }) => {
      if (!userId) throw new Error("User not authenticated");

      // Delete existing meal plan if any
      await supabaseClient.from("meal_plans").delete().eq("user_id", userId);

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + params.durationDays - 1);

      // Create new meal plan
      const { data: newPlan, error: planError } = await supabaseClient
        .from("meal_plans")
        .insert([
          {
            user_id: userId,
            daily_budget_inr: params.dailyBudget,
            daily_calorie_limit: params.dailyCalories,
            start_date: startDate.toISOString().split("T")[0],
            end_date: endDate.toISOString().split("T")[0],
          },
        ])
        .select()
        .single();

      if (planError) throw planError;

      // Save allowed dishes
      const allowedDishRecords = params.allowedDishIds.map((dishId) => ({
        meal_plan_id: newPlan.id,
        menu_item_id: dishId,
      }));

      const { error: dishError } = await supabaseClient
        .from("meal_plan_allowed_dishes")
        .insert(allowedDishRecords);

      if (dishError) throw dishError;

      // Generate meal plan items with improved algorithm
      const mealPlanItems = await generateMealPlanWithVariety(
        newPlan.id,
        params.allowedDishIds,
        params.dailyBudget,
        params.dailyCalories,
        params.durationDays,
      );

      const { error: itemError } = await supabaseClient
        .from("meal_plan_items")
        .insert(mealPlanItems);

      if (itemError) throw itemError;

      return newPlan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meal-plan"] });
      queryClient.invalidateQueries({ queryKey: ["meal-plan-items"] });
    },
  });

  // Delete meal plan
  const deleteMealPlan = useMutation({
    mutationFn: async () => {
      if (!mealPlan?.id) throw new Error("No meal plan to delete");
      const { error } = await supabaseClient
        .from("meal_plans")
        .delete()
        .eq("id", mealPlan.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meal-plan"] });
      queryClient.invalidateQueries({ queryKey: ["meal-plan-items"] });
    },
  });

  // Toggle meal completion
  const toggleMealCompletion = useMutation({
    mutationFn: async (mealItemId: string) => {
      const { data: current, error: fetchError } = await supabaseClient
        .from("meal_plan_items")
        .select("completed, completed_at")
        .eq("id", mealItemId)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabaseClient
        .from("meal_plan_items")
        .update({
          completed: !current.completed,
          completed_at: !current.completed ? new Date().toISOString() : null,
        })
        .eq("id", mealItemId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meal-plan-items"] });
    },
  });

  // Swap meal item
  const swapMealItem = useMutation({
    mutationFn: async (params: {
      mealItemId: string;
      newMenuItemId: string;
    }) => {
      const { error } = await supabaseClient
        .from("meal_plan_items")
        .update({ menu_item_id: params.newMenuItemId })
        .eq("id", params.mealItemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meal-plan-items"] });
    },
  });

  return {
    mealPlan,
    mealPlanItems,
    isLoading,
    createMealPlan,
    deleteMealPlan,
    toggleMealCompletion,
    swapMealItem,
  };
};

// ============ IMPROVED ALGORITHM ============

/**
 * Generates a meal plan with variety across days
 * Algorithm:
 * 1. Track usage frequency of each dish across the entire plan
 * 2. For each day, select dishes that maintain budget/calorie constraints
 * 3. Prioritize least-used dishes to maximize variety
 * 4. Use randomization when dishes have equal scores (same rating + fit score)
 * 5. Never repeat on the same day
 */
async function generateMealPlanWithVariety(
  mealPlanId: string,
  allowedDishIds: string[],
  dailyBudget: number,
  dailyCalories: number,
  durationDays: number,
): Promise<Database["public"]["Tables"]["meal_plan_items"]["Insert"][]> {
  const { data: dishes, error } = await supabaseClient
    .from("menu_items")
    .select("id, price_inr, calories, avg_rating")
    .in("id", allowedDishIds)
    .eq("available", true);

  if (error) throw error;

  if (!dishes || dishes.length < 2) {
    throw new Error("Need at least 2 different dishes to generate a meal plan");
  }

  const mealItems: Database["public"]["Tables"]["meal_plan_items"]["Insert"][] =
    [];
  const budgetPerMeal = dailyBudget / 2;
  const caloriesPerMeal = dailyCalories / 2;

  // Track dish usage across the entire plan
  const dishUsageCount = new Map<string, number>(dishes.map((d) => [d.id, 0]));

  for (let day = 1; day <= durationDays; day++) {
    const usedToday = new Set<string>();

    // Lunch
    const lunchDish = selectDishWithVariety(
      dishes as MenuItemForSelection[],
      budgetPerMeal,
      caloriesPerMeal,
      usedToday,
      dishUsageCount,
    );

    if (lunchDish) {
      mealItems.push({
        meal_plan_id: mealPlanId,
        day_number: day,
        meal_type: "lunch",
        menu_item_id: lunchDish.id,
      });
      usedToday.add(lunchDish.id);
      dishUsageCount.set(
        lunchDish.id,
        (dishUsageCount.get(lunchDish.id) ?? 0) + 1,
      );
    }

    // Dinner
    const dinnerDish = selectDishWithVariety(
      dishes as MenuItemForSelection[],
      budgetPerMeal,
      caloriesPerMeal,
      usedToday,
      dishUsageCount,
    );

    if (dinnerDish) {
      mealItems.push({
        meal_plan_id: mealPlanId,
        day_number: day,
        meal_type: "dinner",
        menu_item_id: dinnerDish.id,
      });
      dishUsageCount.set(
        dinnerDish.id,
        (dishUsageCount.get(dinnerDish.id) ?? 0) + 1,
      );
    }
  }

  return mealItems;
}

/**
 * Selects a dish prioritizing:
 * 1. Within budget and calorie constraints
 * 2. Not used today (lunch/dinner variety)
 * 3. Least used overall (to maximize plan variety)
 * 4. Highest rated (among equally-used dishes)
 * 5. Random selection if tied (to break monotony)
 */
function selectDishWithVariety(
  dishes: MenuItemForSelection[],
  budgetPerMeal: number,
  caloriesPerMeal: number,
  usedToday: Set<string>,
  dishUsageCount: Map<string, number>,
): MenuItemForSelection | undefined {
  // Filter valid dishes
  const valid = dishes.filter(
    (d) =>
      !usedToday.has(d.id) &&
      d.price_inr <= budgetPerMeal &&
      (d.calories ?? 0) <= caloriesPerMeal,
  );

  if (valid.length === 0) return undefined;

  // If only one valid option, return it
  if (valid.length === 1) return valid[0];

  // Calculate a score: prioritize low usage + high rating
  const scored = valid.map((dish) => {
    const usageCount = dishUsageCount.get(dish.id) ?? 0;
    const rating = dish.avg_rating ?? 0;

    // Lower usage = higher priority (negative to sort ascending)
    // Higher rating = higher priority (as tiebreaker)
    // Score: (usageCount * -100) + rating
    const score = usageCount * -100 + rating;

    return { dish, score, usageCount, rating };
  });

  // Find the best score
  const bestScore = Math.max(...scored.map((s) => s.score));

  // Get all dishes with the best score (ties)
  const topCandidates = scored
    .filter((s) => s.score === bestScore)
    .map((s) => s.dish);

  // If multiple ties, use randomization to break monotony
  if (topCandidates.length > 1) {
    return topCandidates[Math.floor(Math.random() * topCandidates.length)];
  }

  return topCandidates[0];
}
