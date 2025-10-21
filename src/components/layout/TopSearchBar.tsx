// In src/components/layout/TopSearchBar.tsx

"use client";

import React from "react";
import { ChevronDown, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Canteen {
  id: string;
  name: string;
}

interface TopSearchBarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: () => void;
  canteens: Canteen[];
  selectedCanteen: string;
  onCanteenChange: (canteenId: string) => void;
}

export const TopSearchBar: React.FC<TopSearchBarProps> = ({
  searchQuery,
  onSearchQueryChange,
  onSearch,
  canteens,
  selectedCanteen,
  onCanteenChange,
}) => {
  return (
    <section className="bg-gray-50 py-4">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center w-full bg-white rounded-md shadow-md border border-gray-200 h-14 overflow-hidden">
          {/* Location Dropdown Section */}
          <div className="flex items-center pl-4 pr-2 h-full">
            <MapPin className="h-5 w-5 text-red-500 mr-2 shrink-0" />
            <select
              className="appearance-none bg-transparent border-none text-gray-800 font-semibold focus:outline-none cursor-pointer pr-6 text-sm"
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

          {/* Vertical Divider */}
          <div className="h-1/2 border-l border-gray-300"></div>

          {/* Search Input Section */}
          <div className="flex-1 relative flex items-center pl-4 h-full">
            <Search className="h-5 w-5 text-gray-400 mr-3" />
            <Input
              placeholder="Search for restaurant, cuisine or a dish"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              className="h-full border-0 text-gray-900 placeholder:text-gray-500 text-sm focus-visible:ring-0 w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
