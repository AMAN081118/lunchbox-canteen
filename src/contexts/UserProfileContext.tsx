"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase/client";
import Loader from "@/app/Loader";

// ------------------ Type Definitions ------------------
export type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: "student" | "owner";
  hostel_id: string | null;
  hostel_name: string | null;
  preferred_canteen_id: string | null;
};

type UserProfileContextType = {
  profile: UserProfile | null;
  loading: boolean;
  refetchProfile: () => Promise<void>;
};

// ------------------ Context Setup ------------------
const UserProfileContext = createContext<UserProfileContextType>({
  profile: null,
  loading: true,
  refetchProfile: async () => {},
});

export const useUserProfile = () => useContext(UserProfileContext);

// ------------------ Provider Component ------------------
export function UserProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabaseClient
        .from("profiles")
        .select(
          "id, email, full_name, role, phone, hostel_id, preferred_canteen_id, hostels(name)",
        )
        .eq("id", user.id)
        .single();

      if (error || !data) {
        setProfile(null);
      } else {
        setProfile({
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          phone: data.phone,
          role: data.role,
          hostel_id: data.hostel_id,
          hostel_name:
            typeof data.hostels?.name === "string" ? data.hostels.name : null,
          preferred_canteen_id: data.preferred_canteen_id,
        });
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ------------------ Loading Guard ------------------
  if (loading) {
    // This ensures no undefined routes or UI flickers
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // ------------------ Render Children Once Ready ------------------
  return (
    <UserProfileContext.Provider
      value={{ profile, loading, refetchProfile: fetchProfile }}
    >
      {children}
    </UserProfileContext.Provider>
  );
}
