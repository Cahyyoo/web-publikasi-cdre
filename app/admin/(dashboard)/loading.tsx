/**
 * Route-level pending UI for admin navigation. Every admin page queries the
 * database on render, so without this a click on the sidebar looks like
 * nothing happened until the query returns.
 */
export default function AdminLoading() {
  return (
    <div className="max-w-3xl animate-pulse" aria-busy="true" aria-live="polite">
      <span className="sr-only">Memuat...</span>
      <div className="h-6 w-48 rounded bg-slate-200" />
      <div className="mt-2 h-4 w-72 rounded bg-slate-100" />
      <div className="mt-6 space-y-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-11 rounded bg-slate-100" />
        ))}
      </div>
    </div>
  );
}
