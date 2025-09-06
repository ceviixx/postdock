import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Sidebar from "@/components/Sidebar";
import LiveSSE from "../components/LiveSSE";
import { Toaster } from "react-notification-kit";

const GITHUB_URL = "https://github.com/ceviixx/postdock";

export const metadata: Metadata = {
  title: "PostDock",
  description: "Minimal development mail inbox",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        <LiveSSE route="/events" />
        <Toaster position="top-right" maxVisible={1} />
        <NavBar githubUrl={GITHUB_URL} />
        <Sidebar />
        <div className="pt-nav lg:pl-sidebar">
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
