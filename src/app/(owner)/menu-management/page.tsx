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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabase/client";
import { ArrowLeft, Plus, Pencil, Trash2, Search } from "lucide-react";
import { useState } from "react";
import { RoleSwitcher } from "@/components/layout/role-switcher";
import Image from "next/image";
import { fullUrl, bucketName } from "@/lib/supabase/bucket";
import type { Database } from "@/types/database.types";

type MenuItem = Database["public"]["Tables"]["menu_items"]["Row"];
type MenuItemsInsert = Database["public"]["Tables"]["menu_items"]["Insert"];
type MenuItemsUpdate = Database["public"]["Tables"]["menu_items"]["Update"];

export default function MenuManagementPage() {
  const { user, signOut } = useAuthContext();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price_inr: "",
    category: "",
    veg: true,
    available: true,
    prep_time_minutes: "",
  });

  // Profile
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

  // Canteen owner
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
      return data;
    },
    enabled: !!user?.id && profile?.role === "owner",
  });

  // Menu items
  const { data: menuItems, isLoading } = useQuery<MenuItem[]>({
    queryKey: ["menu-items", canteenOwner?.canteen_id],
    queryFn: async () => {
      if (!canteenOwner?.canteen_id) return [];
      const { data, error } = await supabaseClient
        .from("menu_items")
        .select("*")
        .eq("canteen_id", canteenOwner.canteen_id)
        .order("category")
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!canteenOwner?.canteen_id,
  });

  // Add item
  const addItemMutation = useMutation({
    mutationFn: async () => {
      let uploadedPath: string | null = null;
      if (imageFile) {
        const sanitizedName = imageFile.name.replace(/\s+/g, "_");
        const timestamp = Date.now();
        const path = `menu/${timestamp}_${sanitizedName}`;

        const { error } = await supabaseClient.storage
          .from(bucketName)
          .upload(path, imageFile, { upsert: false });

        if (error) throw error;
        uploadedPath = path;
      }

      const insertItem: MenuItemsInsert = {
        canteen_id: canteenOwner?.canteen_id ?? "",
        name: formData.name,
        description: formData.description,
        price_inr: parseFloat(formData.price_inr),
        category: formData.category,
        veg: formData.veg,
        available: formData.available,
        prep_time_minutes: parseInt(formData.prep_time_minutes) || 0,
        image_path: uploadedPath,
      };

      const { error } = await supabaseClient
        .from("menu_items")
        .insert([insertItem]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      resetForm();
      setShowAddForm(false);
    },
  });

  // Update item
  const updateItemMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: MenuItemsUpdate;
    }) => {
      let imagePath: string | undefined;

      if (imageFile) {
        const sanitizedName = imageFile.name.replace(/\s+/g, "_");
        const timestamp = Date.now();
        const newPath = `menu/${timestamp}_${sanitizedName}`;

        const { error } = await supabaseClient.storage
          .from(bucketName)
          .upload(newPath, imageFile, { upsert: false });

        if (error) throw error;
        imagePath = newPath;
      }

      // Only update image_path if a new file was selected
      const updatePayload: MenuItemsUpdate = {
        ...updates,
        price_inr: parseFloat(String(updates.price_inr)) || 0,
        prep_time_minutes: parseInt(String(updates.prep_time_minutes)) || 0,
        ...(imagePath ? { image_path: imagePath } : {}),
      };

      const { error } = await supabaseClient
        .from("menu_items")
        .update(updatePayload)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      setEditingItem(null);
      resetForm();
      setShowAddForm(false);
    },
  });

  // Delete item
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseClient
        .from("menu_items")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["menu-items"] }),
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price_inr: "",
      category: "",
      veg: true,
      available: true,
      prep_time_minutes: "",
    });
    setImageFile(null);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || "",
      price_inr: item.price_inr.toString(),
      category: item.category || "",
      veg: item.veg,
      available: item.available,
      prep_time_minutes: item.prep_time_minutes?.toString() || "",
    });
    setShowAddForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateItemMutation.mutate({
        id: editingItem.id,
        updates: {
          name: formData.name,
          description: formData.description,
          price_inr: parseFloat(formData.price_inr),
          category: formData.category,
          veg: formData.veg,
          available: formData.available,
          prep_time_minutes: parseInt(formData.prep_time_minutes) || 0,
        },
      });
    } else {
      addItemMutation.mutate();
    }
  };

  const filteredItems = menuItems?.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute redirectTo="/login">
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
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
                  Menu Management
                </h1>
                {canteenOwner && (
                  <p className="text-sm text-gray-600">
                    {canteenOwner.canteens?.name}
                  </p>
                )}
              </div>
            </div>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          {/* Search + Add */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search menu items..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              onClick={() => {
                setShowAddForm(true);
                setEditingItem(null);
                resetForm();
              }}
              className="bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="h-5 w-5 mr-2" /> Add Item
            </Button>
          </div>

          {/* Form */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingItem ? "Edit Menu Item" : "Add Menu Item"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Name *</Label>
                      <Input
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <Label>Category *</Label>
                      <Input
                        required
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <Label>Price (₹) *</Label>
                      <Input
                        required
                        type="number"
                        step="0.01"
                        value={formData.price_inr}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            price_inr: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label>Prep Time (min)</Label>
                      <Input
                        type="number"
                        value={formData.prep_time_minutes}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            prep_time_minutes: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label>Upload Image</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setImageFile(e.target.files?.[0] || null)
                      }
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit">
                      {editingItem ? "Update" : "Add"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingItem(null);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Menu List */}
          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems?.map((item) => (
                <Card key={item.id} className="hover:shadow-lg flex flex-col">
                  <div className="relative w-full h-40 object-cover">
                    <Image
                      src={
                        item.image_path
                          ? `${fullUrl}${item.image_path}`
                          : `https://placehold.co/400x300?text=${encodeURIComponent(
                              item.name,
                            )}`
                      }
                      alt={item.name}
                      fill
                      unoptimized
                      className="object-cover rounded-xl"
                      priority={false}
                    />
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="font-semibold text-lg">{item.name}</h2>
                        <p className="text-gray-500 text-sm">{item.category}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteItemMutation.mutate(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 justify-between">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.description || "No description"}
                    </p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-lg font-bold text-primary-600">
                        ₹{item.price_inr}
                      </span>
                      <Badge
                        className={
                          item.available
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {item.available ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>

        {profile && (
          <RoleSwitcher currentRole="owner" userRole={profile.role} />
        )}
      </div>
    </ProtectedRoute>
  );
}
