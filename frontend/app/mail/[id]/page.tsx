import Link from "next/link";
import { getMail } from "@/lib/api";
import { DownloadMailButton } from "@/components/DownloadMailButton";
import { DeleteMailButton } from "@/components/DeleteMailButton";
import { Suspense } from "react";
import { MailTabs } from "@/components/MailTabs";
import { IconChevronLeft, IconMail, IconPlus, IconMinus } from "@/components/Icons";

export const revalidate = 0;

export default async function MailDetailPage({ params }: { params: { id: string } }) {
  const mail = await getMail(Number(params.id));
  if (!mail) return (
    <main className="mx-auto max-w-xl p-8 flex flex-col items-center justify-center min-h-[60vh] text-gray-500 bg-white rounded-xl">
      <h1 className="text-2xl font-bold mb-2 text-gray-800">Mail not found</h1>
      <p className="mb-6 text-gray-500">This mail does not exist or could not be loaded.</p>
      <Link
        href="/"
        className="inline-block px-3 py-1.5 border border-black text-black rounded text-sm font-medium transition-colors hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
      >
        Back to Inbox
      </Link>
    </main>
  );

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-8">
      <div className="space-y-3">
        <div className="flex items-center gap-3 mb-1">
          <Link href="/" className="flex items-center" title="Back">
            <IconChevronLeft className="w-4 h-4 text-gray-400 hover:text-blue-600 transition-colors" />
          </Link>
          <h1 className="text-2xl md:text-2xl font-bold text-gray-900 break-words flex-1 truncate">
            {mail.subject || <span className="italic text-gray-400">(no subject)</span>}
          </h1>
          {mail.is_spam && (
            <span className="inline-block bg-red-100 text-red-700 text-xs rounded px-3 py-1 font-bold tracking-wide ml-2">SPAM</span>
          )}
          <div className="inline-flex rounded-full overflow-hidden bg-gray-100 ml-2">
            <DownloadMailButton mailId={mail.id} />
            <DeleteMailButton mailId={mail.id} />
          </div>
        </div>
        <div className="mb-2">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div className="flex items-center gap-2">
              <dt className="flex items-center gap-1">
                <IconMail className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-semibold text-blue-700 uppercase">From</span>:
              </dt>
              <dd className="font-mono text-gray-800 truncate" title={mail.from_addr}>{mail.from_addr}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="flex items-center gap-1">
                <IconMail className="w-4 h-4 text-green-500" />
                <span className="text-xs font-semibold text-green-700 uppercase">To</span>:
              </dt>
              <dd className="font-mono text-gray-800 truncate" title={mail.to_addrs}>{mail.to_addrs}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="flex items-center gap-1">
                <IconMinus className="w-3 h-3 text-gray-500" />
                <span className="text-xs font-semibold text-gray-600 uppercase">Size</span>:
              </dt>
              <dd className="font-mono text-gray-700">{(mail.size / 1024).toFixed(1)} KB</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="flex items-center gap-1">
                <IconPlus className="w-3 h-3 text-purple-500" />
                <span className="text-xs font-semibold text-purple-700 uppercase">ID</span>:
              </dt>
              <dd className="font-mono text-gray-700">{mail.id}</dd>
            </div>
          </dl>
        </div>
      </div>
      <Suspense fallback={<div>Loading preview…</div>}>
        <MailTabs mail={mail} />
      </Suspense>
    </main>
  );
}

