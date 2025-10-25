"use client";
import React from "react";
import Burger from "@/components/loading/Burger";
import CoffeeCup from "@/components/loading/CoffeCup";
import Cup from "../../components/loading/Cup";

export default function ChefLoader() {
  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center h-screen 
      backdrop-blur-xl bg-linear-to-br from-white/10 to-white/5 
      dark:from-gray-800/20 dark:to-gray-900/10
      border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
      animate-fadeIn"
    >
      <div>
        <div className="mb-3 flex justify-between">
          <Burger />
          <CoffeeCup />
          <Cup />
        </div>
        <div className="w-[300px] h-4 bg-white/30 outline-6 outline-red-500 rounded-full shadow-inner backdrop-blur-sm border border-white/30" />
      </div>
    </div>
  );
}
