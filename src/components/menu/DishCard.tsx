// In a new file, e.g., components/menu/DishCard.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

// Define the type for a single item for clarity
interface PopularItem {
  id: string;
  canteen_id: string;
  name: string;
  price_inr: number;
  veg: boolean;
  imageUrl?: string; // Assuming you have an image URL for each dish
  canteens: {
    name: string;
  } | null;
}

interface DishCardProps {
  item: PopularItem;
}

export const DishCard: React.FC<DishCardProps> = ({ item }) => {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/menu/${item.canteen_id}`)}
      className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] flex flex-col cursor-pointer group"
    >
      {/* 1. Proper Image with Lazy Loading */}
      <div className="relative">
        <img
          src={
            item.imageUrl || `https://placehold.co/400x300?text=${item.name}`
          }
          alt={item.name}
          className="w-full h-40 object-cover"
          loading="lazy"
        />
        {/* Veg/Non-Veg Badge remains */}
        <Badge
          className={`absolute top-2 left-2 ${
            item.veg
              ? "bg-green-100 text-green-800 border-green-200"
              : "bg-red-100 text-red-800 border-red-200"
          }`}
        >
          {item.veg ? "Veg" : "Non-Veg"}
        </Badge>
      </div>

      {/* 2. Improved Content Layout & Spacing */}
      <div className="p-4 flex flex-col grow">
        <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">
          {item.name}
        </h3>
        <p className="text-sm text-gray-500 mb-3">{item.canteens?.name}</p>

        {/* 3. Pushed to the bottom using flexbox */}
        <div className="mt-auto flex items-center justify-between">
          <span className="text-xl font-extrabold text-gray-800">
            ₹{item.price_inr}
          </span>
          <span className="text-xs font-semibold text-green-600">Popular</span>
        </div>
      </div>
    </div>
  );
};
