"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// ---------- Interfaces ----------
interface Canteen {
  id: string;
  name: string;
}

interface Hostel {
  id: string;
  name: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  gender?: string | null;
  role: "student" | "owner";
  hostel_id: string | null;
  hostel_name?: string | null;
  preferred_canteen_id: string | null;
}

interface ProfileFormProps {
  profile: UserProfile;
  refetchProfile: () => void;
}

// ---------- Component ----------
export default function ProfileForm({
  profile,
  refetchProfile,
}: ProfileFormProps) {
  const [editing, setEditing] = useState(false);

  // Separate state for form editing
  const [selectedHostel, setSelectedHostel] = useState<string>(
    profile.hostel_id ?? "",
  );
  const [selectedCanteen, setSelectedCanteen] = useState<string>(
    profile.preferred_canteen_id ?? "",
  );

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  // ---------- Fetch dropdown data ----------
  useEffect(() => {
    async function loadDropdowns(): Promise<void> {
      try {
        const { data: canteenData, error: canteenError } = await supabaseClient
          .from("canteens")
          .select("id,name")
          .order("name", { ascending: true });

        const { data: hostelData, error: hostelError } = await supabaseClient
          .from("hostels")
          .select("id,name")
          .order("name", { ascending: true });

        if (canteenError || hostelError) throw canteenError || hostelError;

        setCanteens(canteenData ?? []);
        setHostels(hostelData ?? []);
      } catch (err) {
        console.error("Failed to load dropdown data:", err);
        setError("Failed to fetch hostel/canteen data.");
      } finally {
        setLoadingDropdowns(false);
      }
    }

    loadDropdowns();
  }, []);

  // ---------- Handle save changes ----------
  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    try {
      const { error: updateError } = await supabaseClient
        .from("profiles")
        .update({
          hostel_id: selectedHostel || null,
          preferred_canteen_id: selectedCanteen || null,
        })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      setEditing(false);
      setSuccess("Profile updated successfully!");
      await refetchProfile();
    } catch (err) {
      console.error("Update failed:", err);
      setError(
        err instanceof Error ? err.message : "Error saving profile changes.",
      );
    }
  };

  // ---------- Component JSX ----------
  return (
    <div className="mt-6 space-y-4">
      {/* Email */}
      <div>
        <Label>Email</Label>
        <Input value={profile.email} disabled />
      </div>

      {/* Role */}
      <div>
        <Label>Role</Label>
        <Input value={profile.role} disabled />
      </div>

      {/* Phone */}
      <div>
        <Label>Phone</Label>
        <Input value={profile.phone ?? ""} disabled />
      </div>

      {/* Gender */}
      {profile.gender && (
        <div>
          <Label>Gender</Label>
          <Input value={profile.gender ?? ""} disabled />
        </div>
      )}

      {/* Full Name */}
      <div>
        <Label>Full Name</Label>
        <Input value={profile.full_name ?? ""} disabled />
      </div>

      {/* Hostel */}
      <div>
        <Label>Hostel</Label>
        {loadingDropdowns ? (
          <p className="text-sm text-gray-500">Loading hostels...</p>
        ) : (
          <select
            name="hostel_id"
            value={selectedHostel}
            onChange={(e) => setSelectedHostel(e.target.value)}
            disabled={!editing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select Hostel</option>
            {hostels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Preferred Canteen */}
      <div>
        <Label>Preferred Canteen</Label>
        {loadingDropdowns ? (
          <p className="text-sm text-gray-500">Loading canteens...</p>
        ) : (
          <select
            name="preferred_canteen_id"
            value={selectedCanteen}
            onChange={(e) => setSelectedCanteen(e.target.value)}
            disabled={!editing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select Canteen</option>
            {canteens.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {!editing && (
        <p className="text-xs text-gray-500">
          Click &quot;Edit Profile&quot; to change your hostel or preferred
          canteen.
        </p>
      )}

      {/* Buttons */}
      <div className="flex gap-2 mt-4">
        {editing ? (
          <>
            <Button onClick={handleSave}>Save Changes</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Reset to original profile values
                setSelectedHostel(profile.hostel_id ?? "");
                setSelectedCanteen(profile.preferred_canteen_id ?? "");
                setEditing(false);
                setSuccess(null);
                setError(null);
              }}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button type="button" onClick={() => setEditing(true)}>
            Edit Profile
          </Button>
        )}
      </div>

      {/* Status Messages */}
      {error && (
        <div className="p-2 mt-2 text-sm text-red-600 border border-red-200 rounded bg-red-50">
          {error}
        </div>
      )}
      {success && (
        <div className="p-2 mt-2 text-sm text-green-700 border border-green-200 rounded bg-green-50">
          {success}
        </div>
      )}
    </div>
  );
}
