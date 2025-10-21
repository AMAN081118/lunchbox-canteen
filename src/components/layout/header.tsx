"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Menu, X } from "lucide-react";
import { useAuthContext } from "@/contexts/auth-context";
import { useCartStore } from "@/store/cart-store";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuthContext();
  const { getTotalItems } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartItemsCount = getTotalItems();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-orange bg-clip-text text-transparent group-hover:from-primary-700 group-hover:to-accent-orange transition-all">
              🍽️ LunchBox
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {user ? (
              <>
                <Link
                  href="/canteens"
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive("/canteens")
                      ? "bg-primary-50 text-primary-600"
                      : "text-gray-700 hover:bg-gray-100",
                  )}
                >
                  Canteens
                </Link>
                <Link
                  href="/orders"
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive("/orders")
                      ? "bg-primary-50 text-primary-600"
                      : "text-gray-700 hover:bg-gray-100",
                  )}
                >
                  My Orders
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative ml-2"
                  onClick={() => router.push("/cart")}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemsCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary-600 hover:bg-primary-600">
                      {cartItemsCount}
                    </Badge>
                  )}
                </Button>
                <Button variant="ghost" size="icon" className="ml-2">
                  <User className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={signOut}
                  className="ml-2 border-gray-300 hover:bg-gray-100"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/login")}
                  className="text-gray-700 hover:bg-gray-100"
                >
                  Log In
                </Button>
                <Button
                  onClick={() => router.push("/signup")}
                  className="ml-2 bg-primary-600 hover:bg-primary-700 text-white"
                >
                  Sign Up
                </Button>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-fade-in">
            <nav className="flex flex-col space-y-2">
              {user ? (
                <>
                  <Link
                    href="/canteens"
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive("/canteens")
                        ? "bg-primary-50 text-primary-600"
                        : "text-gray-700 hover:bg-gray-100",
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Canteens
                  </Link>
                  <Link
                    href="/orders"
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive("/orders")
                        ? "bg-primary-50 text-primary-600"
                        : "text-gray-700 hover:bg-gray-100",
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/cart"
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-between"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Cart</span>
                    {cartItemsCount > 0 && (
                      <Badge className="bg-primary-600">{cartItemsCount}</Badge>
                    )}
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      router.push("/login");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    Log In
                  </Button>
                  <Button
                    onClick={() => {
                      router.push("/signup");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start bg-primary-600 hover:bg-primary-700"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
