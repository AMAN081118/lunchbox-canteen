// components/menu/DishCard.tsx

import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import Image from "next/image";
import { fullUrl } from "@/lib/supabase/bucket";

interface PopularItem {
  id: string;
  canteen_id: string;
  name: string;
  description: string | null;
  price_inr: number;
  veg: boolean;
  image_path: string | null;
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
      {/* Image with Veg/Non-Veg Badge */}
      <div className="relative w-full h-40">
        <Image
          src={
            item.image_path
              ? `${fullUrl}${item.image_path}`
              : `https://placehold.co/400x300?text=${item.name}`
          }
          alt={item.name}
          className="w-full h-40 object-cover"
          priority={false}
          fill
        />
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

      {/* Card Content */}
      <div className="p-4 flex flex-col grow">
        <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 text-2xl">
          {item.name}
        </h3>
        {/* Description: 2-line ellipsis */}
        {item.description && (
          <p className="mb-2 text-gray-700 text-base line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Spacer pushes price/canteen label to the bottom */}
        <div className="mt-auto">
          <p className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <MapPin className="h-3.5 w-3.5 text-red-500" />
            {item.canteens?.name}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xl font-extrabold text-gray-800">
              ₹{item.price_inr}
            </span>
            <span className="text-xs font-semibold text-green-600">
              Popular
            </span>
          </div>
          {/* Canteen label below price+badge */}
        </div>
      </div>
    </div>
  );
};
