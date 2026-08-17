export default function ConfigMissingNotice({ envVar, purpose }) {
  return (
    <div className="rounded-xl border border-dashed border-sky-200 bg-sky-50/50 px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-700">
        ⚠
      </div>
      <p className="mt-4 text-sm font-medium text-slate-700">
        {envVar} is not set
      </p>
      <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
        Add {envVar} to .env.local to {purpose}, then restart the dev
        server.
      </p>
    </div>
  );
}
