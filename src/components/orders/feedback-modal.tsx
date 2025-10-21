"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabase/client";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderItems: Array<{
    id: string;
    name: string;
  }>;
}

export function FeedbackModal({
  isOpen,
  onClose,
  orderId,
  orderItems,
}: FeedbackModalProps) {
  const queryClient = useQueryClient();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Get current user
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Submit feedback for each rated item
      const feedbackPromises = orderItems
        .filter((item) => ratings[item.id])
        .map((item) =>
          supabaseClient.from("feedback").insert({
            order_item_id: item.id,
            profile_id: user.id,
            rating: ratings[item.id],
            comment: comments[item.id] || null,
          }),
        );

      await Promise.all(feedbackPromises);

      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      onClose();
    } catch (error) {
      console.error("Feedback submission error:", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{
          animation: "slideUp 0.3s ease-out",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Rate Your Order</h2>
          <p className="text-sm text-gray-600 mt-1">
            Help us improve by sharing your experience
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {orderItems.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold mb-3 text-gray-900">{item.name}</h3>

              {/* Star Rating */}
              <div className="flex items-center gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatings({ ...ratings, [item.id]: star })}
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={cn(
                        "h-8 w-8 transition-colors",
                        star <= (ratings[item.id] || 0)
                          ? "fill-accent-yellow text-accent-yellow"
                          : "text-gray-300 hover:text-accent-yellow",
                      )}
                    />
                  </button>
                ))}
                {ratings[item.id] && (
                  <span className="ml-2 font-semibold text-gray-700">
                    {ratings[item.id]}/5
                  </span>
                )}
              </div>

              {/* Comment */}
              {ratings[item.id] && (
                <Textarea
                  placeholder="Share your thoughts (optional)..."
                  value={comments[item.id] || ""}
                  onChange={(e) =>
                    setComments({ ...comments, [item.id]: e.target.value })
                  }
                  rows={3}
                  className="animate-fade-in resize-none"
                />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 rounded-b-3xl sm:rounded-b-3xl">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12"
              disabled={loading}
            >
              Skip
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || Object.keys(ratings).length === 0}
              className="flex-1 h-12 bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
