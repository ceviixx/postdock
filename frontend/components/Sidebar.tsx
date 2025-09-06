"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import ClearMailboxButton from "@/components/ClearMailboxButton";
import { useRouter } from "next/navigation";

const GITHUB_REPO = "https://github.com/ceviixx/postdock";

export default function Sidebar() {
  const pathname = usePathname();
  const inboxActive = pathname === "/" || pathname?.startsWith("/mail/");
  return (
    <aside
      className="fixed left-0 top-[var(--nav-h)] z-40 hidden h-[calc(100vh-var(--nav-h))] w-[var(--sidebar-w)] border-r border-gray-200 bg-white lg:block"
      role="navigation"
      aria-label="Sidebar Navigation"
    >
      <div className="h-full overflow-y-auto p-4">
        <nav className="space-y-6 text-sm">
          <Section title="Post">
            <NavItem href="/">Inbox</NavItem>
            <div
              className={`transition-all duration-300 ${inboxActive ? 'opacity-100 translate-y-0 max-h-20' : 'opacity-0 -translate-y-2 max-h-0 pointer-events-none'}`}
              aria-hidden={!inboxActive}
            >
              <ClearMailboxButton />
            </div>
          </Section>

          <Section title="Monitoring">
            <NavItem href="/stats">Stats</NavItem>
            <NavItem href="/health">Health</NavItem>
          </Section>

          <Section title="Support">
            <NavItem href="/help">Help</NavItem>
            <a
              href={`${GITHUB_REPO}/issues`}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg px-2 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition flex items-center gap-2"
            >
              GitHub
            </a>
          </Section>
        </nav>
      </div>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function NavItem({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isInbox = href === "/";
  const active = isInbox
    ? pathname === "/" || pathname.startsWith("/mail/")
    : pathname === href;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(href);
    if (isInbox) {
      router.refresh();
    }
  };

  return isInbox ? (
    <button
      onClick={handleClick}
      className={[
        "block rounded-lg px-2 py-2 transition w-full text-left",
        active ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
      ].join(" ")}
    >
      {children}
    </button>
  ) : (
    <Link
      href={href}
      className={[
        "block rounded-lg px-2 py-2 transition",
        active ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}
