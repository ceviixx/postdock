import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/en";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("en");
import { getStats } from "@/lib/api";

export const revalidate = 0;

export default async function StatsPage() {
  const stats = await getStats();
  const userTz = typeof Intl !== "undefined" && Intl.DateTimeFormat().resolvedOptions().timeZone
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : "Europe/Berlin";
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          Statistics
        </h1>
        <div className="text-base text-gray-500">Overview of received mails</div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
        <div className="rounded-xl border bg-white shadow p-5 flex flex-col items-center justify-center min-h-[7.5rem]">
          <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Total mails</div>
          <div className="text-3xl font-bold text-gray-900 leading-tight min-h-[2.5rem] flex items-end">{stats.total}</div>
        </div>
        <div className="rounded-xl border bg-white shadow p-5 flex flex-col items-center justify-center min-h-[7.5rem]">
          <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Recipients</div>
          <div className="text-3xl font-bold text-gray-900 leading-tight min-h-[2.5rem] flex items-end">{stats.recipients}</div>
        </div>
        <div className="rounded-xl border bg-white shadow p-5 flex flex-col items-center justify-center min-h-[7.5rem]">
          <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Avg. mails/day</div>
          <div className="text-3xl font-bold text-gray-900 leading-tight min-h-[2.5rem] flex items-end">{stats.avg_per_day}</div>
        </div>
        <div className="rounded-xl border bg-white shadow p-5 flex flex-col items-center justify-center min-h-[7.5rem]">
          <div className="text-xs text-gray-500 uppercase font-semibold mb-1">With attachment</div>
          <div className="text-3xl font-bold text-gray-900 leading-tight min-h-[2.5rem] flex items-end">{stats.with_attachment}</div>
        </div>
        <div className="rounded-xl border bg-white shadow p-5 flex flex-col items-center justify-center min-h-[7.5rem]">
          <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Largest mail</div>
          <div className="flex items-baseline gap-1 text-3xl font-bold text-gray-900 leading-tight min-h-[2.5rem]">
            {stats.max_size ? (stats.max_size / 1024).toFixed(1) : "-"}
            <span className="text-xs text-gray-400 uppercase tracking-wider">
              {stats.max_size ? "KB" : "-"}
            </span>
          </div>
        </div>
        <div className="rounded-xl border bg-white shadow p-5 flex flex-col items-center justify-center min-h-[7.5rem]">
          <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Last mail</div>
          {stats.last_mail ? (
            <div className="flex flex-col items-center justify-center min-h-[2.5rem]">
              <span className="text-2xl font-bold text-gray-900 leading-tight">
                {dayjs.utc(stats.last_mail).tz(userTz).format("YYYY-MM-DD")}
              </span>
              <span className="text-xl font-bold text-gray-700 leading-tight">
                {dayjs.utc(stats.last_mail).tz(userTz).format("HH:mm")}
              </span>
            </div>
          ) : (
            <div className="text-3xl font-bold text-gray-400 min-h-[2.5rem] flex items-end">-</div>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-white shadow p-5">
          <h2 className="text-lg font-semibold mb-3 text-blue-700">Top senders</h2>
          <ul className="divide-y divide-gray-100">
            {stats.top_senders.length === 0 && (
              <li className="py-2 text-sm text-gray-400">No data</li>
            )}
            {stats.top_senders.map(([addr, n]) => (
              <li key={addr} className="flex items-center justify-between py-2">
                <span className="truncate text-gray-700 font-medium">{addr || "(empty)"}</span>
                <span className="inline-block min-w-[2rem] text-center rounded-full bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5">{n}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border bg-white shadow p-5">
          <h2 className="text-lg font-semibold mb-3 text-purple-700">Top subjects</h2>
          <ul className="divide-y divide-gray-100">
            {stats.top_subjects.length === 0 && (
              <li className="py-2 text-sm text-gray-400">No data</li>
            )}
            {stats.top_subjects.map(([subject, n]) => (
              <li key={subject} className="flex items-center justify-between py-2">
                <span className={subject ? "truncate text-gray-700 font-medium" : "truncate text-gray-400 font-medium italic"}>
                  {subject || "(no subject)"}
                </span>
                <span className="inline-block min-w-[2rem] text-center rounded-full bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5">{n}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border bg-white shadow p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-3 text-green-700">Mails per day</h2>
          <ul className="divide-y divide-gray-100">
            {stats.timeline.length === 0 && (
              <li className="py-2 text-sm text-gray-400">No data</li>
            )}
            {stats.timeline.map(([day, n]) => (
              <li key={day} className="flex items-center justify-between py-2">
                <span className="text-gray-700 font-medium">{day}</span>
                <span className="inline-block min-w-[2rem] text-center rounded-full bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5">{n}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}