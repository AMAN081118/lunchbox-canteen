"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuthContext } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Megaphone,
  Settings as SettingsIcon,
} from "lucide-react";
import { useState } from "react";
import { RoleSwitcher } from "@/components/layout/role-switcher";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const { user, signOut } = useAuthContext();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [canteenData, setCanteenData] = useState({
    name: "",
    gst_no: "",
  });

  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    message: "",
    type: "info" as "info" | "warning" | "success" | "error",
  });

  // Fetch profile
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      const { data, error } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch canteen owner
  const { data: canteenOwner } = useQuery({
    queryKey: ["canteen-owner", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      const { data, error } = await supabaseClient
        .from("canteen_owners")
        .select("*, canteens(*)")
        .eq("owner_profile_id", user.id)
        .single();
      if (error) throw error;

      // Set initial form data
      if (data?.canteens) {
        setCanteenData({
          name: data.canteens.name || "",
          gst_no: data.canteens.gst_no || "",
        });
      }

      return data;
    },
    enabled: !!user?.id && profile?.role === "owner",
  });

  // Fetch announcements
  const { data: announcements } = useQuery({
    queryKey: ["announcements", canteenOwner?.canteen_id],
    queryFn: async () => {
      if (!canteenOwner?.canteen_id) return [];
      const { data, error } = await supabaseClient
        .from("announcements")
        .select("*")
        .eq("canteen_id", canteenOwner.canteen_id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!canteenOwner?.canteen_id,
  });

  // Update canteen mutation
  const updateCanteenMutation = useMutation({
    mutationFn: async (updates: Partial<{ name: string; gst_no: string }>) => {
      if (!canteenOwner?.canteen_id) {
        throw new Error("Canteen owner not loaded yet.");
      }

      const { error } = await supabaseClient
        .from("canteens")
        .update(updates)
        .eq("id", canteenOwner.canteen_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["canteen-owner"] });
      alert("Canteen details updated successfully!");
    },
  });

  // Add announcement mutation
  const addAnnouncementMutation = useMutation({
    mutationFn: async (announcement: {
      title: string;
      message: string;
      type: "info" | "warning" | "success" | "error";
    }) => {
      if (!canteenOwner?.canteen_id) {
        throw new Error("Canteen owner not found or not loaded yet.");
      }

      const { error } = await supabaseClient.from("announcements").insert({
        ...announcement,
        canteen_id: canteenOwner.canteen_id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      setAnnouncementForm({ title: "", message: "", type: "info" });
    },
  });

  // Delete announcement mutation
  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseClient
        .from("announcements")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  // Toggle announcement active status
  const toggleAnnouncementMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabaseClient
        .from("announcements")
        .update({ is_active: isActive })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  const handleCanteenUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateCanteenMutation.mutate(canteenData);
  };

  const handleAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAnnouncementMutation.mutate(announcementForm);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const getAnnouncementColor = (type: string) => {
    switch (type) {
      case "info":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "success":
        return "bg-green-100 text-green-800 border-green-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (profile && profile.role !== "owner") {
    return (
      <ProtectedRoute redirectTo="/login">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                Only canteen owners can access this page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/canteens")}>
                Go to Student Portal
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute redirectTo="/login">
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/dashboard")}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Canteen Settings
                  </h1>
                  {canteenOwner && (
                    <p className="text-sm text-gray-600">
                      {canteenOwner.canteens?.name}
                    </p>
                  )}
                </div>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Tabs defaultValue="canteen" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="canteen">
                <SettingsIcon className="h-4 w-4 mr-2" />
                Canteen Details
              </TabsTrigger>
              <TabsTrigger value="announcements">
                <Megaphone className="h-4 w-4 mr-2" />
                Announcements
              </TabsTrigger>
            </TabsList>

            {/* Canteen Details Tab */}
            <TabsContent value="canteen" className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>Canteen Information</CardTitle>
                  <CardDescription>
                    Update your canteen&apos;s basic information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCanteenUpdate} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Canteen Name</Label>
                      <Input
                        id="name"
                        value={canteenData.name}
                        onChange={(e) =>
                          setCanteenData({
                            ...canteenData,
                            name: e.target.value,
                          })
                        }
                        placeholder="Enter canteen name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="gst">GST Number (Optional)</Label>
                      <Input
                        id="gst"
                        value={canteenData.gst_no}
                        onChange={(e) =>
                          setCanteenData({
                            ...canteenData,
                            gst_no: e.target.value,
                          })
                        }
                        placeholder="22AAAAA0000A1Z5"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={updateCanteenMutation.isPending}
                      className="bg-primary-600 hover:bg-primary-700"
                    >
                      {updateCanteenMutation.isPending
                        ? "Saving..."
                        : "Save Changes"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Announcements Tab */}
            <TabsContent
              value="announcements"
              className="space-y-6 animate-fade-in"
            >
              {/* Add Announcement Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Create Announcement</CardTitle>
                  <CardDescription>
                    Post updates or alerts for your customers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={handleAnnouncementSubmit}
                    className="space-y-4"
                  >
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        required
                        value={announcementForm.title}
                        onChange={(e) =>
                          setAnnouncementForm({
                            ...announcementForm,
                            title: e.target.value,
                          })
                        }
                        placeholder="e.g., Special Offer Today!"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        required
                        value={announcementForm.message}
                        onChange={(e) =>
                          setAnnouncementForm({
                            ...announcementForm,
                            message: e.target.value,
                          })
                        }
                        placeholder="Write your announcement message..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="type">Type</Label>
                      <select
                        id="type"
                        value={announcementForm.type}
                        onChange={(e) =>
                          setAnnouncementForm({
                            ...announcementForm,
                            type: e.target.value as
                              | "info"
                              | "success"
                              | "warning"
                              | "error",
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="info">Info (Blue)</option>
                        <option value="success">Success (Green)</option>
                        <option value="warning">Warning (Yellow)</option>
                        <option value="error">Alert (Red)</option>
                      </select>
                    </div>

                    <Button
                      type="submit"
                      disabled={addAnnouncementMutation.isPending}
                      className="bg-primary-600 hover:bg-primary-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Post Announcement
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Active Announcements List */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Announcements</CardTitle>
                  <CardDescription>
                    Manage your current announcements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {announcements && announcements.length > 0 ? (
                    <div className="space-y-3">
                      {announcements.map((announcement) => (
                        <div
                          key={announcement.id}
                          className={`p-4 rounded-lg border-2 ${getAnnouncementColor(
                            announcement.type,
                          )}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">
                                  {announcement.title}
                                </h4>
                                <Badge
                                  variant={
                                    announcement.is_active
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {announcement.is_active
                                    ? "Active"
                                    : "Inactive"}
                                </Badge>
                              </div>
                              <p className="text-sm mb-2">
                                {announcement.message}
                              </p>
                              <p className="text-xs opacity-75">
                                Created{" "}
                                {new Date(
                                  announcement.created_at,
                                ).toLocaleString("en-IN")}
                              </p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  toggleAnnouncementMutation.mutate({
                                    id: announcement.id,
                                    isActive: !announcement.is_active,
                                  })
                                }
                              >
                                {announcement.is_active ? "Hide" : "Show"}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (confirm("Delete this announcement?")) {
                                    deleteAnnouncementMutation.mutate(
                                      announcement.id,
                                    );
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-600 py-8">
                      No announcements yet. Create your first one above!
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        {/* Role Switcher */}
        {profile && (
          <RoleSwitcher currentRole="owner" userRole={profile.role} />
        )}
      </div>
    </ProtectedRoute>
  );
}
