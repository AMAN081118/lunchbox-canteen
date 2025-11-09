"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useOrderAnalytics } from "@/hooks/useOrderAnalytics";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface OrderAnalyticsProps {
  userId: string;
}

export default function OrderAnalytics({ userId }: OrderAnalyticsProps) {
  const [daysFilter, setDaysFilter] = useState(180);
  const { data: analytics, isLoading } = useOrderAnalytics(userId, daysFilter);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="h-24 bg-gray-200 animate-pulse rounded" />
            <div className="h-48 bg-gray-200 animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-gray-600 text-center text-sm">
            No order data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary-600">
              {analytics.totalOrders}
            </p>
            <p className="text-xs text-gray-500 mt-1">Last {daysFilter} days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary-600">
              ₹{analytics.totalSpent.toFixed(0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Average: ₹
              {(
                analytics.totalSpent / Math.max(analytics.totalOrders, 1)
              ).toFixed(0)}
              /order
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[30, 90, 180, 365].map((days) => (
          <button
            key={days}
            onClick={() => setDaysFilter(days)}
            className={`px-4 py-2 rounded text-sm font-medium whitespace-nowrap transition ${
              daysFilter === days
                ? "bg-primary-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {days === 30
              ? "1M"
              : days === 90
              ? "3M"
              : days === 180
              ? "6M"
              : "1Y"}
          </button>
        ))}
      </div>

      {/* Monthly Chart */}
      {analytics.monthlyData.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Monthly Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="spent"
                    stroke="#3b82f6"
                    name="Amount (₹)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#10b981"
                    name="Orders"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Canteen Breakdown */}
      {analytics.canteenData.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Spending by Canteen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.canteenData.map((canteen) => (
                <div
                  key={canteen.canteenName}
                  className="flex items-center justify-between pb-3 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium text-sm">{canteen.canteenName}</p>
                    <p className="text-xs text-gray-500">
                      {canteen.orders} orders
                    </p>
                  </div>
                  <p className="font-semibold text-primary-600">
                    ₹{canteen.spent.toFixed(0)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
