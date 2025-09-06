"use client";

import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
    return (
        <html>
            <body className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800">
                <div className="max-w-md w-full bg-white rounded-2xl p-8 flex flex-col items-center border border-gray-100">
                    <div className="mb-4">
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="20" cy="20" r="20" fill="#f3f4f6" />
                            <path d="M20 11v13" stroke="#d32d2f" strokeWidth="2.2" strokeLinecap="round" />
                            <circle cx="20" cy="29" r="1.5" fill="#d32d2f" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
                    <p className="mb-5 text-gray-500 text-center text-base max-w-xs">
                        {error?.message || "An unexpected error occurred. Please try again or go back to the inbox."}
                    </p>
                    <div className="flex gap-2 w-full justify-center">
                        <button
                            onClick={() => reset()}
                            className="px-4 py-2 rounded-full bg-black text-white font-semibold hover:bg-gray-800 transition"
                        >
                            Retry
                        </button>
                        <Link
                            href="/"
                            className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition"
                        >
                            Back to Inbox
                        </Link>
                    </div>
                </div>
            </body>
        </html>
    );
}
