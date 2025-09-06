import Link from "next/link";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/en";
import RelativeTime from "@/components/RelativeTime";
import { listMails } from "@/lib/api";
import { IconChevronRight } from "@/components/Icons";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("en");

export const revalidate = 0;

export default async function Home() {
  const mails = await listMails();
  if (!mails) {
    return (
      <main className="mx-auto max-w-4xl p-6 space-y-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Inbox</h1>
          <div className="text-base text-gray-500">All received mails at a glance</div>
        </div>
        <div className="p-6 text-center text-sm text-gray-400">Could not load mails.</div>
      </main>
    );
  }

  const userTz = typeof Intl !== "undefined" && Intl.DateTimeFormat().resolvedOptions().timeZone
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : "Europe/Berlin";

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Inbox</h1>
        <div className="text-base text-gray-500">All received mails at a glance</div>
      </div>
      <ul className="divide-y divide-gray-100 rounded-xl border bg-white shadow-sm overflow-hidden">
        {mails.length === 0 && (
          <li className="p-6 text-center text-sm text-gray-400">
            No mails yet. Send something to port 2525.
          </li>
        )}
        {mails.map(m => (
          <li key={m.id}>
            <Link
              href={`/mail/${m.id}`}
              className="flex flex-col gap-1 p-4 group transition cursor-pointer outline-none focus:bg-blue-100 hover:bg-gray-100"
              tabIndex={0}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium truncate max-w-[70%] text-gray-900 group-hover:text-blue-700">
                  {m.subject || <span className="italic text-gray-400">(no subject)</span>}
                </span>
                <span className="flex items-center gap-1 min-w-[90px] justify-end">
                  <RelativeTime date={m.date} userTz={userTz} className="text-xs text-gray-500 text-right" />
                  <span className="flex items-center">
                    <IconChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors" />
                  </span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="inline-block bg-gray-100 text-gray-700 text-xs rounded px-2 py-0.5 font-mono max-w-[50%] truncate" title={m.from_addr}>
                  {m.from_addr}
                </span>
                <span className="inline-block bg-gray-100 text-gray-700 text-xs rounded px-2 py-0.5 font-mono max-w-[50%] truncate" title={m.from_addr}>
                  {formatSize(m.size)}
                </span>
                {m.is_spam && (
                  <span className="inline-block bg-red-100 text-red-700 text-xs rounded px-2 py-0.5 font-bold tracking-wide">SPAM</span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
