"use client";

import { downloadMail } from "@/lib/api";
import { useCallback } from "react";
import { useTransition } from "react";
import { IconLoading, IconDownload } from "./Icons";

export function DownloadMailButton({ mailId }: { mailId: number }) {
  const [pending, startTransition] = useTransition();

  const handleDownload = useCallback(async () => {
    const blob = await downloadMail(mailId);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mail-${mailId}.eml`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      a.remove();
    }, 100);
  }, [mailId]);

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(handleDownload);
      }}
      className="px-4 py-2 rounded bg-gray-100 text-gray-700 text-xs font-semibold hover:text-blue-700 hover:bg-blue-200 transition disabled:opacity-60"
    >
        {pending ? (
            <IconLoading className=" h-5 w-5 text-gray-400" />
        ) : (
            <IconDownload className="w-5 h-5" />
        )}
      
    </button>
  );
}
