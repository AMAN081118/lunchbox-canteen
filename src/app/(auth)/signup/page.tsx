"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { SignupModal } from "@/components/auth/signup-modal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Store } from "lucide-react";

export default function SignupPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [userType, setUserType] = useState<"student" | "owner">("student");

  const openModal = (type: "student" | "owner") => {
    setUserType(type);
    setModalOpen(true);
  };

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 pt-4 pb-12 px-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Join LunchBox
            </h1>
            <p className="text-lg text-gray-600">
              Choose your account type to get started
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 animate-slide-up">
            {/* Student Card */}
            <Card className="border-2 hover:border-primary-600 hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-600 transition-colors mt-2">
                  <User className="h-10 w-10 text-primary-600 group-hover:text-white transition-colors" />
                </div>
                <CardTitle className="text-2xl">I&apos;m a Student</CardTitle>
                <CardDescription className="text-base mt-2">
                  Order delicious food from campus canteens
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-sm text-gray-600">
                    <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      ✓
                    </span>
                    Browse multiple canteens
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      ✓
                    </span>
                    Quick & easy ordering
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      ✓
                    </span>
                    Track your orders in real-time
                  </li>
                </ul>
                <Button
                  onClick={() => openModal("student")}
                  className="w-full bg-primary-600 hover:bg-primary-700 h-12 text-lg font-semibold"
                >
                  Sign Up as Student
                </Button>
              </CardContent>
            </Card>

            {/* Owner Card */}
            <Card className="border-2 hover:border-accent-orange hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 mt-2 bg-accent-orange/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-orange transition-colors">
                  <Store className="h-10 w-10 text-accent-orange group-hover:text-white transition-colors" />
                </div>
                <CardTitle className="text-2xl">
                  I&apos;m a Canteen Owner
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Manage your canteen and grow your business
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-sm text-gray-600">
                    <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      ✓
                    </span>
                    Manage orders efficiently
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 shrink-0">
                      ✓
                    </span>
                    Update menu in real-time
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      ✓
                    </span>
                    View analytics & insights
                  </li>
                </ul>
                <Button
                  onClick={() => openModal("owner")}
                  className="w-full bg-accent-orange hover:bg-accent-orange/90 h-12 text-lg font-semibold"
                >
                  Sign Up as Owner
                </Button>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-gray-600 mt-8">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-primary-600 hover:underline font-medium"
            >
              Log In
            </a>
          </p>
        </div>
      </div>

      {/* Signup Modal */}
      <SignupModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        userType={userType}
      />
    </MainLayout>
  );
}
