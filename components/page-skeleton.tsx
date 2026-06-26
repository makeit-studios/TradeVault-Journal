export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-4 md:p-6">
      <div className="h-8 w-48 rounded bg-secondary" />
      <div className="h-4 w-96 rounded bg-secondary/60" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-secondary/40" />
        ))}
      </div>
      <div className="h-72 rounded-lg bg-secondary/40" />
    </div>
  );
}
