"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteMail } from "@/lib/api";
import { IconLoading, IconTrash } from "./Icons";

export function DeleteMailButton({ mailId }: { mailId: number }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function handleDelete() {
    await deleteMail(mailId);
    router.replace("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      className="px-4 py-2 rounded bg-gray-100 text-gray-700 text-xs font-semibold hover:text-red-700 hover:bg-red-200 transition disabled:opacity-60"
      disabled={pending}
      onClick={() => {
        startTransition(handleDelete);
      }}
    >
      {pending ? (
        <IconLoading className=" h-5 w-5 text-gray-400" />
      ) : (
        <IconTrash className="w-5 h-5" />
      )}
    </button>
  );
}