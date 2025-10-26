"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, User, Mail, Phone, Building2, MapPin } from "lucide-react";
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
  const [validEmail, setValidEmail] = useState(true);
  const [formValid, setFormValid] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "",
    hostelId: "",
    canteenName: "",
    gstNo: "",
    basedHostelId: "",
  });

  const { data: hostels } = useQuery({
    queryKey: ["hostels"],
    queryFn: async () => {
      const { data, error } = await supabaseClient.from("hostels").select("*");
      if (error) throw error;
      return data;
    },
    enabled: isOpen,
  });

  // Validate inputs dynamically
  useEffect(() => {
    setError(null);

    const isEmailValid =
      userType === "student"
        ? /^[a-zA-Z0-9._%+-]+@iiitdmj\.ac\.in$/i.test(formData.email)
        : formData.email.includes("@") && formData.email.includes(".");
    setValidEmail(isEmailValid);

    const requiredFields =
      userType === "student"
        ? [
            formData.fullName,
            formData.email,
            formData.phone,
            formData.gender,
            formData.password,
            formData.confirmPassword,
            formData.hostelId,
          ]
        : [
            formData.fullName,
            formData.email,
            formData.phone,
            formData.gender,
            formData.password,
            formData.confirmPassword,
            formData.canteenName,
            formData.basedHostelId,
          ];

    const allFilled = requiredFields.every((f) => f.trim() !== "");
    const passwordsMatch = formData.password === formData.confirmPassword;
    const passwordStrong = formData.password.length >= 6;

    setFormValid(allFilled && passwordsMatch && passwordStrong && isEmailValid);
  }, [formData, userType]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid) return;
    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } =
        await supabaseClient.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              phone: formData.phone,
              gender: formData.gender,
              role: userType,
              hostel_id:
                userType === "student"
                  ? formData.hostelId
                  : formData.basedHostelId,
              preferred_canteen_id: null,
            },
          },
        });
      if (authError) throw authError;

      const userId = authData?.user?.id;
      if (!userId) throw new Error("Signup failed. Please try again.");

      if (userType === "owner") {
        const { data: canteen, error: canteenError } = await supabaseClient
          .from("canteens")
          .insert({
            name: formData.canteenName,
            gst_no: formData.gstNo || null,
            based_hostel_id: formData.basedHostelId,
          })
          .select()
          .single();
        if (canteenError) throw canteenError;

        const { error: ownerError } = await supabaseClient
          .from("canteen_owners")
          .insert({
            canteen_id: canteen.id,
            owner_profile_id: userId,
          });
        if (ownerError) throw ownerError;

        await supabaseClient
          .from("profiles")
          .update({
            preferred_canteen_id: canteen.id,
            hostel_id: formData.basedHostelId,
          })
          .eq("id", userId);
      }

      onClose();
      router.push(userType === "student" ? "/canteens" : "/dashboard");
    } catch (err: unknown) {
      console.error("Signup failed. Please try again.");
      if (err instanceof Error) {
        setError(err.message || "Signup failed. Please try again.");
      } else {
        setError("Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div
        className={cn(
          "relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl",
          "animate-slide-up transition-transform duration-300 scrollbar-elegant-thumb",
        )}
        style={{
          animation: "slideUp 0.3s ease-out",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 pb-4 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {userType === "student" ? "Student Signup" : "Canteen Owner Signup"}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {userType === "student"
              ? "Use your official @iiitdmj.ac.in email for verification"
              : "Register your canteen and owner details"}
          </p>
        </div>

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
              required
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
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
              placeholder={
                userType === "student"
                  ? "yourname@iiitdmj.ac.in"
                  : "your@email.com"
              }
              className={
                !validEmail
                  ? "border-red-500 focus:border-red-600 focus:ring-red-300"
                  : "border-gray-300"
              }
            />
            {!validEmail && (
              <p className="text-xs text-red-600 mt-1">
                Please use a valid{" "}
                {userType === "student" ? "@iiitdmj.ac.in" : ""}
                email.
              </p>
            )}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Student Hostel */}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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

          {/* Owner Canteen Details */}
          {userType === "owner" && (
            <>
              <div>
                <Label
                  htmlFor="canteenName"
                  className="flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  Canteen Name
                </Label>
                <Input
                  id="canteenName"
                  name="canteenName"
                  required
                  value={formData.canteenName}
                  onChange={handleChange}
                  placeholder="Canteen Name"
                />
              </div>

              <div>
                <Label htmlFor="gstNo">GST Number (optional)</Label>
                <Input
                  id="gstNo"
                  name="gstNo"
                  value={formData.gstNo}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="basedHostelId">Canteen Based Hostel</Label>
                <select
                  id="basedHostelId"
                  name="basedHostelId"
                  required
                  value={formData.basedHostelId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Hostel</option>
                  {hostels?.map((hostel) => (
                    <option key={hostel.id} value={hostel.id}>
                      {hostel.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Password Fields */}
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
            />
          </div>

          <Button
            type="submit"
            className={`w-full h-12 text-lg font-semibold ${
              formValid
                ? "bg-primary-600 hover:bg-primary-700"
                : "bg-gray-300 cursor-not-allowed"
            }`}
            disabled={!formValid || loading}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>
      </div>
    </div>
  );
}
