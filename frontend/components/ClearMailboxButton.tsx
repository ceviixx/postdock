"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { clearMails } from "@/lib/api";

export default function ClearMailboxButton() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onConfirm() {
    setBusy(true);
    setError(null);
    try {
      await clearMails();
      setOpen(false);
      router.replace('/');
      router.refresh();
    } catch (e: unknown) {
      if (e && typeof e === "object" && "message" in e && typeof (e as { message?: unknown }).message === "string") {
        setError((e as { message?: string }).message ?? "Unknown error");
      } else {
        setError("Unknown error");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full text-left block rounded-lg px-2 py-2 text-red-700 hover:bg-red-50 hover:text-red-800 transition"
      >
        Clear mailbox
      </button>

      {open && typeof window !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 p-4">
              <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-gray-200 flex flex-col justify-center items-center">
                <div className="p-5 space-y-3 w-full">
                  <h3 className="text-lg font-semibold">Delete all mails?</h3>
                  <p className="text-sm text-gray-600">
                    This will permanently remove all stored emails from the database.
                  </p>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setOpen(false)}
                      disabled={busy}
                      className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-100 disabled:opacity-60"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={onConfirm}
                      disabled={busy}
                      className="inline-flex items-center rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                    >
                      {busy ? "Deleting..." : "Yes, delete all"}
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
