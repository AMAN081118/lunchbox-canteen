"use client";

import { useEffect, useState } from "react";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { supabaseClient } from "@/lib/supabase/client";
import ProfileForm, { UserProfile } from "@/components/profile/ProfileForm";

export default function ProfilePage() {
  const { profile, loading: profileLoading } = useUserProfile();
  const [gender, setGender] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch only gender — not whole profile
  const fetchGender = async (id: string) => {
    try {
      const { data, error } = await supabaseClient
        .from("profiles")
        .select("gender")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (data?.gender) setGender(data.gender);
    } catch (err) {
      console.error("Error fetching gender:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.id) fetchGender(profile.id);
  }, [profile?.id]);

  if (profileLoading || loading)
    return <div className="p-8">Loading profile…</div>;

  if (!profile) return <div className="p-8">Profile not found.</div>;

  // Merge gender only for local usage
  const fullProfile: UserProfile & { gender?: string | null } = {
    ...profile,
    gender,
  };

  return (
    <div className="max-w-lg mx-auto mt-8 bg-white rounded-xl shadow p-8">
      <h2 className="text-2xl font-bold mb-4">Your Profile</h2>
      <ProfileForm
        profile={fullProfile}
        refetchProfile={() => fetchGender(profile.id)}
      />
    </div>
  );
}
