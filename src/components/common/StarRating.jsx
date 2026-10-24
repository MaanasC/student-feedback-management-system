import React from "react";
import { Star } from "lucide-react";

export function StarRating({ rating = 0, max = 5, size = "md", showValue = false, className = "" }) {
  const starSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < Math.floor(rating);
          const half = !filled && i < rating;
          return (
            <Star
              key={i}
              className={`${starSizes[size]} ${
                filled
                  ? "fill-amber-400 text-amber-400"
                  : half
                  ? "fill-amber-200 text-amber-400"
                  : "fill-slate-100 text-slate-300"
              }`}
            />
          );
        })}
      </div>
      {showValue && (
        <span className="ml-1 text-xs font-bold text-slate-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

export default StarRating;
