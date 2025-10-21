"use client";

import React from "react";
import { ChevronDown, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Canteen {
  id: string;
  name: string;
}

interface HeroSearchBarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: () => void;
  canteens: Canteen[];
  selectedCanteen: string;
  onCanteenChange: (canteenId: string) => void;
}

export const HeroSearchBar: React.FC<HeroSearchBarProps> = ({
  searchQuery,
  onSearchQueryChange,
  onSearch,
  canteens,
  selectedCanteen,
  onCanteenChange,
}) => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-2 flex flex-col md:flex-row gap-2 transition-all duration-300 hover:shadow-xl border border-gray-100">
        <div className="flex items-center p-2 border-b md:border-b-0 md:border-r border-gray-200 w-full md:w-auto">
          <MapPin className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
          <select
            className="appearance-none bg-transparent border-none text-gray-700 font-medium focus:outline-none cursor-pointer pr-6 text-base w-full"
            value={selectedCanteen}
            onChange={(e) => onCanteenChange(e.target.value)}
          >
            <option value="all">All Canteens</option>
            {canteens.map((canteen) => (
              <option key={canteen.id} value={canteen.id}>
                {canteen.name}
              </option>
            ))}
          </select>
          <ChevronDown className="h-4 w-4 text-gray-400 -ml-5 pointer-events-none" />
        </div>

        <div className="flex-1 relative flex items-center">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
          <Input
            placeholder="Search for dishes or canteens..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            className="pl-12 h-14 border-0 text-gray-900 placeholder:text-gray-500 text-base focus-visible:ring-0 w-full"
          />
        </div>

        <Button
          size="lg"
          onClick={onSearch}
          className="h-14 px-8 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg"
        >
          Search
        </Button>
      </div>
    </div>
  );
};
