export const Skeleton = ({ className = "" }) => {
  return <div className={`animate-pulse bg-muted rounded-lg ${className}`} />;
};

export const CardSkeleton = () => {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
};
