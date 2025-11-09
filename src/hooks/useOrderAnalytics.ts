import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type Canteen = Database["public"]["Tables"]["canteens"]["Row"];

interface OrderWithCanteen extends Order {
  canteens?: Pick<Canteen, "name">;
}

export interface OrderAnalytics {
  totalOrders: number;
  totalSpent: number;
  monthlyData: Array<{
    month: string;
    orders: number;
    spent: number;
  }>;
  canteenData: Array<{
    canteenName: string;
    orders: number;
    spent: number;
  }>;
}

export const useOrderAnalytics = (
  userId: string | undefined,
  days: number = 180,
) => {
  return useQuery({
    queryKey: ["order-analytics", userId, days],
    queryFn: async (): Promise<OrderAnalytics> => {
      if (!userId) throw new Error("User not authenticated");

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { data: orders, error } = await supabaseClient
        .from("orders")
        .select(
          `
          id,
          total_price_inr,
          placed_at,
          canteens(name)
        `,
        )
        .eq("user_id", userId)
        .eq("status", "completed")
        .gte("placed_at", cutoffDate.toISOString());

      if (error) throw error;

      const typedOrders = (orders as OrderWithCanteen[]) || [];
      const totalOrders = typedOrders.length;
      const totalSpent = typedOrders.reduce(
        (sum, o) => sum + (o.total_price_inr ?? 0),
        0,
      );

      // Monthly breakdown
      const monthlyMap = new Map<string, { orders: number; spent: number }>();
      typedOrders.forEach((order) => {
        const date = new Date(order.placed_at);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1,
        ).padStart(2, "0")}`;
        const current = monthlyMap.get(monthKey) ?? { orders: 0, spent: 0 };
        monthlyMap.set(monthKey, {
          orders: current.orders + 1,
          spent: current.spent + (order.total_price_inr ?? 0),
        });
      });

      const monthlyData = Array.from(monthlyMap.entries())
        .sort()
        .map(([month, data]) => ({
          month,
          ...data,
        }));

      // Canteen breakdown
      const canteenMap = new Map<string, { orders: number; spent: number }>();
      typedOrders.forEach((order) => {
        const canteenName =
          (order.canteens as Pick<Canteen, "name"> | null)?.name ?? "Unknown";
        const current = canteenMap.get(canteenName) ?? {
          orders: 0,
          spent: 0,
        };
        canteenMap.set(canteenName, {
          orders: current.orders + 1,
          spent: current.spent + (order.total_price_inr ?? 0),
        });
      });

      const canteenData = Array.from(canteenMap.entries())
        .map(([canteenName, data]) => ({
          canteenName,
          ...data,
        }))
        .sort((a, b) => b.spent - a.spent);

      return {
        totalOrders,
        totalSpent,
        monthlyData,
        canteenData,
      };
    },
    enabled: !!userId,
  });
};
