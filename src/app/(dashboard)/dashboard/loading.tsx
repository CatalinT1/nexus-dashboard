export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-7 w-36 rounded-lg bg-slate-200" />
          <div className="h-4 w-52 rounded bg-slate-100" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-20 rounded-lg bg-slate-200" />
          <div className="h-8 w-36 rounded-lg bg-slate-200" />
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-slate-100" />
                <div className="h-7 w-20 rounded bg-slate-200" />
                <div className="h-3 w-28 rounded bg-slate-100" />
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-100" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts placeholder */}
      <div className="rounded-xl border border-slate-200 bg-white h-64" />

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-xl border border-slate-200 bg-white h-52" />
        <div className="rounded-xl border border-slate-200 bg-white h-52" />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-slate-100 shrink-0" />
            <div className="h-3 w-20 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
