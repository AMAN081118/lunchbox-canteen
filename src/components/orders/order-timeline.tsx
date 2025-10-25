"use client";

import {
  CheckCircle2,
  Clock,
  Package,
  Utensils,
  XCircle,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderTimelineProps {
  status:
    | "pending"
    | "accepted"
    | "rejected"
    | "in_preparation"
    | "ready_for_pickup"
    | "completed"
    | "cancelled";
  createdAt: string;
}

export function OrderTimeline({ status, createdAt }: OrderTimelineProps) {
  const steps = [
    { key: "pending", label: "Order Placed", icon: Clock },
    { key: "accepted", label: "Confirmed", icon: CheckCircle2 },
    { key: "in_preparation", label: "Preparing", icon: Utensils },
    { key: "ready_for_pickup", label: "Ready", icon: Package },
    { key: "completed", label: "Completed", icon: CheckCircle2 },
  ];

  const statusOrder = [
    "pending",
    "accepted",
    "in_preparation",
    "ready_for_pickup",
    "completed",
  ];
  const currentIndex = statusOrder.indexOf(status);

  // Handle rejected/cancelled separately
  if (status === "rejected" || status === "cancelled") {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-3 text-red-800">
          <div className="w-12 h-12 rounded-full bg-red-200 flex items-center justify-center">
            <XCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-lg">
              Order {status === "rejected" ? "Rejected" : "Cancelled"}
            </p>
            <p className="text-sm">
              Please contact the canteen for more details
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
      <div className="space-y-6">
        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="relative">
              {/* Vertical Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute left-6 top-12 w-0.5 h-12",
                    isCompleted ? "bg-green-500" : "bg-gray-300",
                  )}
                />
              )}

              {/* Step Content */}
              <div className="flex items-center gap-4">
                {/* Icon Circle */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-300",
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isCurrent
                      ? "bg-primary-500 text-white animate-pulse"
                      : "bg-gray-200 text-gray-400",
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : isCurrent ? (
                    <Icon className="h-6 w-6" />
                  ) : (
                    <Circle className="h-6 w-6" />
                  )}
                </div>

                {/* Label */}
                <div className="flex-1">
                  <p
                    className={cn(
                      "font-semibold",
                      isCompleted || isCurrent
                        ? "text-gray-900"
                        : "text-gray-400",
                    )}
                  >
                    {step.label}
                  </p>
                  {/* ✅ FIXED: Only show "In Progress" if not completed */}
                  {isCurrent && status !== "completed" && (
                    <p className="text-sm text-primary-600 font-medium animate-fade-in">
                      In Progress...
                    </p>
                  )}
                  {/* ✅ FIXED: Show "Completed" for all finished steps including current when status is completed */}
                  {isCompleted && (status === "completed" || !isCurrent) && (
                    <p className="text-sm text-green-600">✓ Completed</p>
                  )}
                </div>

                {/* Time (for completed steps) */}
                {isCompleted && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {index === 0
                        ? new Date(createdAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Estimated Time - ✅ FIXED: Only show if not completed */}
      {status !== "completed" && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Estimated Time:</span>
            <span className="font-semibold text-gray-900">15-20 minutes</span>
          </div>
        </div>
      )}
    </div>
  );
}
