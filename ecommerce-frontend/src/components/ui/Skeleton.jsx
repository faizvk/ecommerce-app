/**
 * Skeleton loader — content-shaped placeholder that feels much better than a
 * spinner. Use these instead of "Loading…" or a centered spinner whenever the
 * shape of the loaded content is predictable.
 */

export function Skeleton({ className = "", as: Tag = "div", ...rest }) {
  return (
    <Tag
      aria-hidden="true"
      className={`animate-pulse bg-gray-200/70 rounded-md ${className}`}
      {...rest}
    />
  );
}

/** Skeleton matching <ProductCard /> shape — drop into a grid in place of cards. */
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <Skeleton className="w-full aspect-square rounded-none" />
      <div className="p-3 md:p-4 flex flex-col gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-2 mt-1">
          <Skeleton className="h-4 w-12 rounded" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-9 w-full mt-2 rounded-xl" />
      </div>
    </div>
  );
}

/** A grid of N ProductCardSkeleton — handy on Search/Home initial load. */
export function ProductCardSkeletonGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Single horizontal product row skeleton (used on Cart, Wishlist). */
export function ProductRowSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 flex flex-col sm:flex-row gap-4">
      <Skeleton className="w-full h-44 sm:w-28 sm:h-28 rounded-xl flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-5 w-1/3" />
        <div className="flex gap-2 mt-1">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-20 rounded-xl ml-auto" />
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
