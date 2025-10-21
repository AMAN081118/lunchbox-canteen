// OfferBanner.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";

// --- 1. TYPESCRIPT INTERFACE for Offer Data (Simulates CRM structure) ---
interface OfferData {
  id: number;
  discount: string;
  offerType: string;
  description: string;
  linkHref: string;
  linkText: string;
  imageUrl: string;
}

// --- 2. RANDOM DATA GENERATION FUNCTION ---
const generateRandomOffer = (): OfferData => {
  const offers: OfferData[] = [
    {
      id: 1,
      discount: "50%",
      offerType: "OFF",
      description: "on your dining bills with LunchBox",
      linkHref: "/offers/dining-deals",
      linkText: "Check Dining Deals",
      imageUrl:
        "https://img.freepik.com/free-photo/delicious-chicken-rolls-stuffed-with-cheese-spinach-wrapped-strips-bacon-top-view_2829-17420.jpg?semt=ais_hybrid&w=740&q=80", // Placeholder for actual image
    },
    {
      id: 2,
      discount: "₹100",
      offerType: "Cashback",
      description: "on orders above ₹299",
      linkHref: "/offers/cashback",
      linkText: "View Cashback T&C",
      imageUrl:
        "https://img.freepik.com/free-photo/delicious-chicken-rolls-stuffed-with-cheese-spinach-wrapped-strips-bacon-top-view_2829-17420.jpg?semt=ais_hybrid&w=740&q=80", // Placeholder
    },
    {
      id: 3,
      discount: "30%",
      offerType: "OFF",
      description: "on all breakfast items today!",
      linkHref: "/offers/breakfast",
      linkText: "Order Breakfast",
      imageUrl:
        "https://img.freepik.com/free-photo/delicious-chicken-rolls-stuffed-with-cheese-spinach-wrapped-strips-bacon-top-view_2829-17420.jpg?semt=ais_hybrid&w=740&q=80", // Placeholder
    },
  ];

  const randomIndex = Math.floor(Math.random() * offers.length);
  return offers[randomIndex];
};

// --- 3. PRESENTATIONAL COMPONENT ---
interface OfferBannerProps {
  data: OfferData;
}

const OfferBanner: React.FC<OfferBannerProps> = ({ data }) => {
  const { discount, offerType, description, linkHref, imageUrl } = data;

  return (
    <div
      className="w-full max-w-7xl mx-auto overflow-hidden rounded-lg shadow-xl"
      // Style management for modularity: The background image is managed here
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Link href={linkHref} className="block w-full h-full">
        <div className="relative p-6 sm:p-10 lg:p-12 min-h-[160px] flex flex-col justify-end text-white bg-black/60 transition-all duration-300 hover:bg-black/40">
          {/* Main Discount Text (Large and Bold) */}
          <div className="flex items-baseline mb-2">
            <span className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-none tracking-tight">
              {discount}
            </span>
            <span className="text-3xl sm:text-4xl lg:text-5xl font-bold ml-2 leading-none">
              {offerType}
            </span>
          </div>

          {/* Description Text */}
          <p className="text-xl sm:text-2xl font-medium mt-2">{description}</p>
        </div>
      </Link>
    </div>
  );
};

// --- 4. CONTAINER COMPONENT (Handles initial data fetching/generation) ---
const Offers: React.FC = () => {
  const [offer, setOffer] = useState<OfferData | null>(null);

  useEffect(() => {
    // Generate a random offer only once on load
    setOffer(generateRandomOffer());
  }, []);

  if (!offer) {
    // Basic loading state or skeleton
    return (
      <div className="flex justify-center mt-4 w-full max-w-7xl mx-auto">
        <div className="w-full h-40 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex justify-center mt-4 px-4 sm:px-6 lg:px-8 mb-4">
      <OfferBanner data={offer} />
    </div>
  );
};

export default Offers;
