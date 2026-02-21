import { Skeleton } from '@/components/ui/skeleton';

/** Stat card skeleton matching the dashboard stat cards */
export const StatCardSkeleton = () => (
  <div className="airbnb-card p-5">
    <div className="flex items-center justify-between mb-3">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <Skeleton className="w-12 h-4 rounded-full" />
    </div>
    <Skeleton className="w-20 h-3 rounded mb-2" />
    <Skeleton className="w-16 h-8 rounded" />
    <Skeleton className="w-full h-1.5 rounded-full mt-3" />
    <Skeleton className="w-24 h-3 rounded mt-2" />
  </div>
);

/** Chart card skeleton */
export const ChartCardSkeleton = () => (
  <div className="airbnb-card p-5">
    <Skeleton className="w-24 h-3 rounded mb-4" />
    <Skeleton className="w-full h-[180px] rounded-xl" />
  </div>
);

/** Activity list skeleton */
export const ActivityListSkeleton = () => (
  <div className="airbnb-card-static overflow-hidden">
    <div className="px-5 py-4 border-b border-border">
      <Skeleton className="w-24 h-3 rounded" />
    </div>
    <div className="space-y-0">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={`flex items-center gap-3 px-5 py-3 ${i < 4 ? 'border-b border-border' : ''}`}>
          <Skeleton className="w-7 h-7 rounded-full flex-shrink-0" />
          <div className="flex-1">
            <Skeleton className="w-3/4 h-3 rounded" />
          </div>
          <Skeleton className="w-8 h-3 rounded" />
        </div>
      ))}
    </div>
  </div>
);

/** Status/priority breakdown skeleton */
export const BreakdownSkeleton = () => (
  <div className="airbnb-card-static p-5">
    <Skeleton className="w-20 h-3 rounded mb-4" />
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="w-2 h-2 rounded-full" />
          <Skeleton className="flex-1 h-3 rounded" />
          <Skeleton className="w-6 h-3 rounded" />
        </div>
      ))}
    </div>
    <Skeleton className="w-full h-px mt-4" />
    <Skeleton className="w-24 h-3 rounded mt-4" />
  </div>
);

/** Team workload skeleton */
export const TeamWorkloadSkeleton = () => (
  <div className="airbnb-card-static p-5">
    <Skeleton className="w-24 h-3 rounded mb-4" />
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="text-center">
          <Skeleton className="w-10 h-10 rounded-full mx-auto mb-2" />
          <Skeleton className="w-12 h-3 rounded mx-auto" />
          <Skeleton className="w-full h-1 rounded-full my-1.5" />
          <Skeleton className="w-8 h-3 rounded mx-auto" />
        </div>
      ))}
    </div>
  </div>
);

/** Repository grid skeleton */
export const RepoGridSkeleton = () => (
  <div className="airbnb-card-static p-5">
    <Skeleton className="w-24 h-3 rounded mb-4" />
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 p-3 rounded-xl">
          <Skeleton className="w-2 h-2 rounded-full flex-shrink-0" />
          <div className="flex-1">
            <Skeleton className="w-20 h-3 rounded mb-1" />
            <Skeleton className="w-16 h-2 rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/** Team member card skeleton */
export const TeamMemberCardSkeleton = () => (
  <div className="airbnb-card p-6">
    <Skeleton className="w-16 h-16 rounded-full mb-4" />
    <Skeleton className="w-28 h-4 rounded mb-2" />
    <Skeleton className="w-36 h-3 rounded mb-4" />
    <div className="flex flex-wrap gap-1.5 mb-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="w-14 h-5 rounded-full" />
      ))}
    </div>
    <div>
      <div className="flex justify-between mb-2">
        <Skeleton className="w-24 h-3 rounded" />
        <Skeleton className="w-8 h-3 rounded" />
      </div>
      <Skeleton className="w-full h-1.5 rounded-full" />
    </div>
    <Skeleton className="w-full h-10 rounded-full mt-5" />
  </div>
);

/** Integration card skeleton */
export const IntegrationCardSkeleton = () => (
  <div className="airbnb-card p-6">
    <Skeleton className="w-14 h-14 rounded-2xl mb-5" />
    <Skeleton className="w-20 h-5 rounded mb-2" />
    <Skeleton className="w-full h-3 rounded mb-1" />
    <Skeleton className="w-3/4 h-3 rounded mb-5" />
    <Skeleton className="w-24 h-8 rounded-full" />
  </div>
);

/** Settings profile skeleton */
export const ProfileSkeleton = () => (
  <div>
    <Skeleton className="w-20 h-6 rounded mb-6" />
    <div className="flex items-start gap-6 mb-8">
      <Skeleton className="w-24 h-24 rounded-full" />
      <div>
        <Skeleton className="w-28 h-9 rounded-full mb-2" />
        <Skeleton className="w-40 h-3 rounded" />
      </div>
    </div>
    <div className="space-y-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i}>
          <Skeleton className="w-16 h-3 rounded mb-2" />
          <Skeleton className="w-full h-10 rounded-xl" />
        </div>
      ))}
    </div>
    <Skeleton className="w-32 h-10 rounded-full mt-8" />
  </div>
);

/** Chat sidebar conversation skeleton */
export const ConversationListSkeleton = () => (
  <div className="space-y-1 p-2">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="px-4 py-3 rounded-xl">
        <Skeleton className="w-3/4 h-4 rounded mb-1" />
        <Skeleton className="w-1/2 h-3 rounded" />
      </div>
    ))}
  </div>
);

/** Sidebar quick stats skeleton */
export const SidebarStatsSkeleton = () => (
  <div className="space-y-1 mt-1">
    {Array.from({ length: 2 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-secondary/50">
        <Skeleton className="w-4 h-4 rounded" />
        <Skeleton className="flex-1 h-3 rounded" />
        <Skeleton className="w-6 h-3 rounded" />
      </div>
    ))}
    <div className="mt-3 pt-3 border-t border-border">
      <Skeleton className="w-20 h-2 rounded px-3 mb-2" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl">
          <Skeleton className="w-6 h-6 rounded-lg" />
          <Skeleton className="flex-1 h-3 rounded" />
          <Skeleton className="w-4 h-3 rounded" />
        </div>
      ))}
    </div>
    <div className="mt-3 pt-3 border-t border-border">
      <Skeleton className="w-12 h-2 rounded px-3 mb-2" />
      <div className="flex items-center justify-between px-3">
        <div className="flex -space-x-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-7 h-7 rounded-full border-2 border-card" />
          ))}
        </div>
        <Skeleton className="w-14 h-3 rounded" />
      </div>
    </div>
  </div>
);
