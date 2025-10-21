"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw, Store, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserPreferencesStore } from "@/store/user-preferences-store";

interface RoleSwitcherProps {
  currentRole: "owner" | "student";
  userRole: "owner" | "student";
}

export function RoleSwitcher({ currentRole, userRole }: RoleSwitcherProps) {
  const router = useRouter();
  const { defaultMode, setDefaultMode } = useUserPreferencesStore();
  const [isOwner, setIsOwner] = useState(currentRole === "owner");

  // Only show for owner users
  if (userRole !== "owner") return null;

  const handleSwitch = () => {
    if (isOwner) {
      router.push("/canteens");
      setIsOwner(false);
    } else {
      router.push("/dashboard");
      setIsOwner(true);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
      {/* Main Switch Button */}
      <Button
        onClick={handleSwitch}
        className={cn(
          "h-14 px-6 rounded-full shadow-2xl font-semibold flex items-center gap-3 transition-all hover:scale-105",
          isOwner
            ? "bg-primary-600 hover:bg-primary-700"
            : "bg-accent-orange hover:bg-accent-orange/90",
        )}
      >
        <RefreshCw className="h-5 w-5" />
        <span className="hidden sm:inline">
          Switch to {isOwner ? "Student" : "Owner"}
        </span>
        <span className="sm:hidden">{isOwner ? "Student" : "Owner"}</span>
        {isOwner ? <User className="h-5 w-5" /> : <Store className="h-5 w-5" />}
      </Button>

      {/* Settings Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-14 w-14 rounded-full shadow-xl bg-white hover:bg-gray-50"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => setDefaultMode("owner")}>
            <Store className="h-4 w-4 mr-2" />
            Default to Owner Mode
            {defaultMode === "owner" && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDefaultMode("student")}>
            <User className="h-4 w-4 mr-2" />
            Default to Student Mode
            {defaultMode === "student" && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
