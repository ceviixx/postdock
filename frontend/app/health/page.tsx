import { fullHealth } from "@/lib/api";

export const revalidate = 0;

export default async function HealthPage() {
  let data: Awaited<ReturnType<typeof fullHealth>> | null = null;
  let err: string | null = null;

  try {
    data = await fullHealth();
  } catch (e: unknown) {
    if (e && typeof e === "object" && "message" in e && typeof (e as { message?: unknown }).message === "string") {
      err = (e as { message?: string }).message ?? null;
    } else {
      err = "Health check failed";
    }
  }

  const statusPill = (ok: boolean, text: string) => (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold
      ${ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
      <span className={`h-2 w-2 rounded-full ${ok ? "bg-green-600" : "bg-red-600"}`} />
      {text}
    </span>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">System Health</h1>
        <div className="text-base text-gray-500">Status overview of all core systems</div>
        {data && (
          <div className="mt-4">
            {data.smtp.ok && data.db.ok
              ? statusPill(true, "All systems OK")
              : statusPill(false, "Problems detected")}
          </div>
        )}
      </div>

      {err && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm text-red-700 font-medium">
          Error: {err}
        </div>
      )}

      {data && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div className="rounded-xl border bg-white shadow p-5 flex flex-col items-center">
            <div className="text-xs text-gray-500 uppercase font-semibold mb-1">API</div>
            <div className="text-2xl font-bold text-gray-900 mb-1">Backend server</div>
            <div className="mt-1 text-xs text-gray-600 text-center min-h-[32px]">&nbsp;</div>
            {statusPill(true, "OK")}
          </div>

          <div className="rounded-xl border bg-white shadow p-5 flex flex-col items-center">
            <div className="text-xs text-gray-500 uppercase font-semibold mb-1">SMTP</div>
            <div className="text-2xl font-bold text-gray-900 mb-1">Mail server</div>
            <div className="mt-1 text-xs text-gray-600 text-center">
              Latency: {data.smtp.latency_ms ?? "-"} ms<br />
              {data.smtp.banner && <span>Banner: <span className="font-mono">{data.smtp.banner}</span></span>}
              {data.smtp.error && <span className="block text-red-600">Error: {data.smtp.error}</span>}
            </div>
            <div className="mt-2">{statusPill(!!data.smtp.ok, data.smtp.ok ? "OK" : "DOWN")}</div>
          </div>

          <div className="rounded-xl border bg-white shadow p-5 flex flex-col items-center">
            <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Database</div>
            <div className="text-2xl font-bold text-gray-900 mb-1">Mail database</div>
            <div className="mt-1 text-xs text-gray-600 text-center">
              Type: <span className="font-mono">{data.db.type}</span><br />
              Size: {data.db.size_bytes != null ? `${data.db.size_bytes} B` : "-"}
            </div>
            <div className="mt-2">{statusPill(!!data.db.ok, data.db.ok ? "OK" : "Missing")}</div>
          </div>
        </div>
      )}
    </div>
  );
}