"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuthContext } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { RoleSwitcher } from "@/components/layout/role-switcher";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function CanteensPage() {
  const { user, signOut } = useAuthContext();
  const router = useRouter();
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabaseClient
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch canteens from database
  const {
    data: canteens,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["canteens"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("canteens")
        .select(
          `
          *,
          hostels:based_hostel_id (
            id,
            name
          )
        `,
        )
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <ProtectedRoute redirectTo="/login">
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Canteens</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-600">
                Failed to load canteens. Please try again.
              </p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && canteens?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">
                No canteens available at the moment.
              </p>
            </div>
          )}

          {/* Canteens Grid */}
          {canteens && canteens.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {canteens.map((canteen) => (
                <Card
                  key={canteen.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <CardTitle>{canteen.name}</CardTitle>
                    <CardDescription>
                      {canteen.hostels?.name || "Multiple Locations"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full"
                      onClick={() => router.push(`/menu/${canteen.id}`)}
                    >
                      View Menu
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
        {profile && (
          <RoleSwitcher currentRole="student" userRole={profile.role} />
        )}
      </div>
    </ProtectedRoute>
  );
}
