export default function AppLoading() {
  return (
    <main className="px-4 py-5 sm:px-6 lg:px-8" aria-label="Loading workspace">
      <section className="mx-auto max-w-[1500px] animate-pulse">
        <div className="mb-5 h-[260px] rounded-[28px] border border-black/[0.05] bg-white/70" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-[340px] rounded-[22px] border border-black/[0.05] bg-white/70" />
          <div className="h-[340px] rounded-[22px] border border-black/[0.05] bg-white/70" />
        </div>
      </section>
    </main>
  );
}
