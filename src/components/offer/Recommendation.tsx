"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
// --- TYPESCRIPT INTERFACE FOR MEAL DATA ---
interface Meal {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags: string | null;
  strYoutube: string | null;
}

// --- CONSTANTS ---
const MEALS_PER_LOAD = 5;
const MAX_MEALS = 5;
const RANDOM_MEAL_API = "https://www.themealdb.com/api/json/v1/1/random.php";

// --- MEAL CARD COMPONENT ---
interface MealCardProps {
  meal: Meal;
}

const MealCard: React.FC<MealCardProps> = ({ meal }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] flex flex-col text-left">
      {/* Next.js Image component for optimization */}
      <div className="relative w-full h-64">
        <Image
          src={meal.strMealThumb}
          alt={meal.strMeal}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          placeholder="blur"
          blurDataURL={meal.strMealThumb} // Optional: can use a low-res placeholder
          priority={false} // Controls if image should preload; 'false' means lazy load
        />
      </div>
      <div className="p-5 flex flex-col grow">
        <h2 className="text-xl font-bold text-gray-900 mb-2">{meal.strMeal}</h2>
        <div className="text-sm text-gray-500 mb-4 space-y-1">
          <p>
            <strong className="font-semibold">Category:</strong>{" "}
            {meal.strCategory}
          </p>
          <p>
            <strong className="font-semibold">Cuisine:</strong> {meal.strArea}
          </p>
        </div>

        {/* Modern <details> for instructions visibility */}
        <details className="mt-auto pt-3 border-t border-gray-100">
          <summary className="cursor-pointer font-medium text-blue-600 hover:text-blue-800">
            View Instructions
          </summary>
          <p className="mt-2 text-sm text-gray-700 max-h-40 overflow-y-auto">
            {meal.strInstructions}
          </p>
        </details>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const Recommendation: React.FC = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Ref for the element that triggers the load (The Intersection Observer Target)
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Function to fetch a single random meal (memoized)
  const fetchSingleRandomMeal = useCallback(async (): Promise<Meal | null> => {
    try {
      const response = await fetch(RANDOM_MEAL_API);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.meals ? data.meals[0] : null;
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  }, []);

  // Function to load a batch of meals (memoized)
  const loadMoreMeals = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    const mealsToFetch = Math.min(MEALS_PER_LOAD, MAX_MEALS - meals.length);

    if (mealsToFetch <= 0) {
      setHasMore(false);
      setIsLoading(false);
      return;
    }

    const mealPromises = Array(mealsToFetch).fill(0).map(fetchSingleRandomMeal);
    const newMeals = (await Promise.all(mealPromises)).filter(
      (meal): meal is Meal => meal !== null,
    );

    setMeals((prevMeals) => [...prevMeals, ...newMeals]);
    setIsLoading(false);

    if (meals.length + newMeals.length >= MAX_MEALS) {
      setHasMore(false);
    }
  }, [isLoading, hasMore, meals.length, fetchSingleRandomMeal]);

  // Intersection Observer Setup
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Trigger loadMoreMeals when the target (loadMoreRef) is visible
        if (entries[0].isIntersecting) {
          loadMoreMeals();
        }
      },
      // rootMargin fires the callback 300px before the element is fully visible
      { rootMargin: "300px" },
    );

    observer.observe(loadMoreRef.current);

    return () => {
      // Cleanup observer on unmount
      observer.disconnect();
    };
  }, [hasMore, loadMoreMeals]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
        Best Food in H4
      </h1>
      <p className="text-gray-500 mb-8 sm:mb-12">Scroll down to discover</p>

      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg text-center">
          Error loading meals: {error}
        </div>
      )}

      {/* Responsive Grid Layout: Mobile-first (1-col) -> Tablet (2-col) -> Desktop (3-col) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {meals.map((meal) => (
          <MealCard
            key={meal.idMeal + meal.strMeal + Math.random() * 1000}
            meal={meal}
          />
        ))}
      </div>

      {/* Intersection Observer Target and Loading Indicator */}
      <div ref={loadMoreRef} className="w-full text-center py-8">
        {isLoading && (
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-blue-600 motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
          >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
        )}

        {!hasMore && meals.length > 0 && (
          <p className="text-lg font-medium mt-4">
            That&apos;s all the meals! Explore more
          </p>
        )}
      </div>
    </div>
  );
};

export default Recommendation;
