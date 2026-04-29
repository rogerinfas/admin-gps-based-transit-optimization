export default function Loading() {
  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground md:px-10">
      <div className="mx-auto w-full max-w-7xl animate-pulse space-y-4">
        <div className="h-8 w-64 rounded-lg bg-surface" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-24 rounded-2xl bg-surface" />
          ))}
        </div>
        <div className="h-96 rounded-2xl bg-surface" />
      </div>
    </main>
  );
}
