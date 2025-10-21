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

export default function MenuManagementPage() {
  const { user, signOut } = useAuthContext();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price_inr: "",
    category: "",
    veg: true,
    available: true,
    prep_time_minutes: "",
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
      return data;
    },
    enabled: !!user?.id && profile?.role === "owner",
  });

  // Fetch menu items
  const { data: menuItems, isLoading } = useQuery({
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

  // Add menu item mutation
  const addItemMutation = useMutation({
    mutationFn: async (item: any) => {
      const { error } = await supabaseClient.from("menu_items").insert({
        ...item,
        canteen_id: canteenOwner?.canteen_id,
        price_inr: parseFloat(item.price_inr),
        prep_time_minutes: item.prep_time_minutes
          ? parseInt(item.prep_time_minutes)
          : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      setShowAddForm(false);
      resetForm();
    },
  });

  // Update menu item mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabaseClient
        .from("menu_items")
        .update({
          ...updates,
          price_inr: parseFloat(updates.price_inr),
          prep_time_minutes: updates.prep_time_minutes
            ? parseInt(updates.prep_time_minutes)
            : null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      setEditingItem(null);
      resetForm();
    },
  });

  // Delete menu item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseClient
        .from("menu_items")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    },
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
  };

  const handleEdit = (item: any) => {
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
      updateItemMutation.mutate({ id: editingItem.id, updates: formData });
    } else {
      addItemMutation.mutate(formData);
    }
  };

  const filteredItems = menuItems?.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
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
                    Menu Management
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

        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
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
              <Plus className="h-5 w-5 mr-2" />
              Add Item
            </Button>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <Card className="mb-6 border-primary-200 animate-slide-up">
              <CardHeader>
                <CardTitle>
                  {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Item Name *</Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="e.g., Masala Dosa"
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Input
                        id="category"
                        required
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        placeholder="e.g., Breakfast, Lunch"
                      />
                    </div>

                    <div>
                      <Label htmlFor="price">Price (₹) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        required
                        value={formData.price_inr}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            price_inr: e.target.value,
                          })
                        }
                        placeholder="50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="prepTime">Prep Time (minutes)</Label>
                      <Input
                        id="prepTime"
                        type="number"
                        value={formData.prep_time_minutes}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            prep_time_minutes: e.target.value,
                          })
                        }
                        placeholder="15"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe the dish..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="veg"
                        checked={formData.veg}
                        onChange={(e) =>
                          setFormData({ ...formData, veg: e.target.checked })
                        }
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <Label htmlFor="veg" className="cursor-pointer">
                        Vegetarian
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="available"
                        checked={formData.available}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            available: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <Label htmlFor="available" className="cursor-pointer">
                        Available
                      </Label>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={
                        addItemMutation.isPending ||
                        updateItemMutation.isPending
                      }
                    >
                      {editingItem ? "Update Item" : "Add Item"}
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

          {/* Menu Items List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : filteredItems && filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {item.category}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
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
                          onClick={() => {
                            if (confirm("Delete this item?")) {
                              deleteItemMutation.mutate(item.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-primary-600">
                        ₹{item.price_inr}
                      </span>
                      <div className="flex gap-2">
                        {item.veg && (
                          <Badge className="bg-green-100 text-green-800">
                            Veg
                          </Badge>
                        )}
                        {item.available ? (
                          <Badge className="bg-blue-100 text-blue-800">
                            Available
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Unavailable</Badge>
                        )}
                      </div>
                    </div>
                    {item.prep_time_minutes && (
                      <p className="text-sm text-gray-500">
                        ⏱️ {item.prep_time_minutes} mins
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600">
                  {searchQuery
                    ? "No items match your search"
                    : "No menu items yet. Add your first item!"}
                </p>
              </CardContent>
            </Card>
          )}
        </main>

        {/* Role Switcher */}
        {profile && (
          <RoleSwitcher currentRole="owner" userRole={profile.role} />
        )}
      </div>
    </ProtectedRoute>
  );
}
