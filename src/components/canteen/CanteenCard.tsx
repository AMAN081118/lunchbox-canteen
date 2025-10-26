"use client";

import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Star, TrendingUp } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Define the type for the canteen data this card expects
interface Canteen {
  id: string;
  name: string;
  img_url: string | null;
  rating: number;
  hostels: {
    id: string;
    name: string;
  };
}

interface CanteenCardProps {
  canteen: Canteen;
}

export const CanteenCard: React.FC<CanteenCardProps> = ({ canteen }) => {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/menu/${canteen.id}`)}
      className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] flex flex-col cursor-pointer group"
    >
      {/* 1. Image header from the recommendation card style */}
      <div className="relative h-48 object-cover">
        <Image
          src={`https://placehold.co/400x300.jpg?text=${canteen.name}`}
          alt={canteen.name}
          className="w-full h-48 object-cover"
          priority={false}
          fill
        />

        <div className="absolute top-4 right-4">
          <Badge className="bg-accent-yellow text-gray-900 font-semibold">
            <TrendingUp className="h-3 w-3 mr-1" />
            Popular
          </Badge>
        </div>
      </div>

      {/* 2. Content area with preserved data */}
      <div className="p-5 flex flex-col grow">
        <h2 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
          {canteen.name}
        </h2>
        <p className="flex items-center gap-2 text-sm text-gray-500">
          <MapPin className="h-4 w-4" />
          {canteen.hostels?.name}
        </p>

        {/* 3. Hardcoded data pushed to the bottom */}
        <div className="mt-auto pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-lg">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-sm text-gray-800">
                {canteen.rating}
              </span>
            </div>
            {/* <span className="text-sm text-gray-600"></span> */}
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span>15-20 mins</span>
            </div>
            <Badge className="bg-green-100 text-green-800">Open Now</Badge>
          </div>
        </div>
      </div>
    </div>
  );
};
