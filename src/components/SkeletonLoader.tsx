import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-0 overflow-hidden flex flex-col justify-between">
      {/* Image Stage Skeleton */}
      <div className="aspect-4/3 w-full skeleton-shimmer" />

      {/* Content Skeleton */}
      <div className="p-4 sm:p-5 space-y-3">
        {/* Category & Condition tags */}
        <div className="flex items-center gap-2">
          <div className="h-3 w-16 rounded-md skeleton-shimmer" />
          <div className="h-3 w-12 rounded-md skeleton-shimmer" />
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <div className="h-4 w-5/6 rounded-md skeleton-shimmer" />
          <div className="h-4 w-2/3 rounded-md skeleton-shimmer" />
        </div>

        {/* Business */}
        <div className="flex items-center justify-between pt-1">
          <div className="h-3 w-24 rounded-md skeleton-shimmer" />
          <div className="h-3 w-10 rounded-md skeleton-shimmer" />
        </div>

        {/* Price & Stock */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="h-6 w-20 rounded-md skeleton-shimmer" />
          <div className="h-3 w-14 rounded-md skeleton-shimmer" />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="h-10 rounded-xl skeleton-shimmer" />
          <div className="h-10 rounded-xl skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
};

export const CategoryCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 flex flex-col justify-between">
      <div className="aspect-square rounded-xl mb-2 sm:mb-3 skeleton-shimmer" />
      <div className="space-y-1">
        <div className="h-3.5 w-3/4 rounded-md skeleton-shimmer" />
        <div className="h-2.5 w-1/2 rounded-md skeleton-shimmer" />
      </div>
    </div>
  );
};
