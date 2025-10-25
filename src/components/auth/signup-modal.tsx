"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, User, Mail, Phone, Lock, Building2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: "student" | "owner";
}

export function SignupModal({ isOpen, onClose, userType }: SignupModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "",
    hostelId: "", // For students
    canteenId: "", // For owners
  });

  // Fetch hostels for student signup
  const { data: hostels } = useQuery({
    queryKey: ["hostels"],
    queryFn: async () => {
      const { data, error } = await supabaseClient.from("hostels").select("*");
      if (error) throw error;
      return data;
    },
    enabled: userType === "student" && isOpen,
  });

  // Fetch canteens for owner signup
  const { data: canteens } = useQuery({
    queryKey: ["canteens-for-owner"],
    queryFn: async () => {
      const { data, error } = await supabaseClient.from("canteens").select("*");
      if (error) throw error;
      return data;
    },
    enabled: userType === "owner" && isOpen,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (userType === "student" && !formData.hostelId) {
      setError("Please select your hostel");
      setLoading(false);
      return;
    }

    if (userType === "owner" && !formData.canteenId) {
      setError("Please select your canteen");
      setLoading(false);
      return;
    }

    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } =
        await supabaseClient.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              phone: formData.phone,
              gender: formData.gender,
              role: userType, // 'student' or 'owner'
              hostel_id: userType === "student" ? formData.hostelId : null,
              preferred_canteen_id: null,
            },
          },
        });

      if (authError) throw authError;

      // If owner, create canteen_owners entry
      if (userType === "owner" && authData.user) {
        const { error: ownerError } = await supabaseClient
          .from("canteen_owners")
          .insert({
            canteen_id: formData.canteenId,
            owner_profile_id: authData.user.id,
          });

        if (ownerError) throw ownerError;
      }

      // Success - close modal and redirect
      onClose();

      if (userType === "student") {
        router.push("/canteens");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      console.error("Signup error:", err);
      if (err instanceof Error) {
        setError(err.message || "Failed to create account. Please try again.");
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div
        className={cn(
          "relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl",
          "animate-slide-up transition-transform duration-300",
        )}
        style={{
          animation: "slideUp 0.3s ease-out",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {userType === "student" ? "Student Signup" : "Canteen Owner Signup"}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {userType === "student"
              ? "Create your account to start ordering"
              : "Register your canteen on LunchBox"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div>
            <Label htmlFor="fullName" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Full Name
            </Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="mt-1"
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className="mt-1"
            />
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 1234567890"
              className="mt-1"
            />
          </div>

          {/* Gender */}
          <div>
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              name="gender"
              required
              value={formData.gender}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Hostel (Student only) */}
          {userType === "student" && (
            <div>
              <Label htmlFor="hostelId" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Hostel
              </Label>
              <select
                id="hostelId"
                name="hostelId"
                required
                value={formData.hostelId}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Your Hostel</option>
                {hostels?.map((hostel) => (
                  <option key={hostel.id} value={hostel.id}>
                    {hostel.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Canteen (Owner only) */}
          {userType === "owner" && (
            <div>
              <Label htmlFor="canteenId" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Canteen
              </Label>
              <select
                id="canteenId"
                name="canteenId"
                required
                value={formData.canteenId}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Your Canteen</option>
                {canteens?.map((canteen) => (
                  <option key={canteen.id} value={canteen.id}>
                    {canteen.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Password */}
          <div>
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              className="mt-1"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <Label
              htmlFor="confirmPassword"
              className="flex items-center gap-2"
            >
              <Lock className="h-4 w-4" />
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              className="mt-1"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 h-12 text-lg font-semibold"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </Button>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push("/login");
              }}
              className="text-primary-600 hover:underline font-medium"
            >
              Log In
            </button>
          </p>
        </form>
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
