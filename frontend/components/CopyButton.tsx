"use client";

import { useState } from "react";
import { IconCopy, IconCheck } from "./Icons";

export default function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="absolute top-2 right-2 border-none bg-transparent p-0 m-0 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
      aria-label="Copy code"
    >
      {copied ? (
        <IconCheck className="w-5 h-5 text-green-600" />
      ) : (
        <IconCopy className="w-5 h-5 text-gray-500 hover:text-blue-600 transition-colors" />
      )}
    </button>
  );
}
