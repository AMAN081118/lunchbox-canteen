"use client";
import React from "react";
import Burger from "@/components/loading/Burger";
import CoffeeCup from "@/components/loading/CoffeCup";
import Cup from "@/components/loading/Cup";

export default function Loader() {
  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center h-screen 
      backdrop-blur-xl bg-linear-to-br from-white/10 to-white/5 
      dark:from-gray-800/20 dark:to-gray-900/10
      border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
      transition-opacity duration-500 ease-in-out animate-fadeIn"
    >
      <div className="flex flex-col items-center">
        {/* moving track */}
        <div className="relative w-[320px] h-24 mb-3 overflow-hidden">
          <div className="absolute inset-0 flex justify-between items-center animate-slide">
            <Burger />
            <CoffeeCup />
            <Cup />
          </div>
        </div>

        {/* track background */}
        <div className="w-[320px] h-4 bg-white/30 outline-6 outline-red-500 rounded-full shadow-inner backdrop-blur-sm border border-white/30 overflow-hidden">
          {/* subtle moving shine effect */}
          <div className="h-full w-full bg-linear-to-r from-transparent via-white/40 to-transparent animate-trackShine" />
        </div>
      </div>
    </div>
  );
}
