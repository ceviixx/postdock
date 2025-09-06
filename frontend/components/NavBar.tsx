import Image from "next/image";
import { IconGithub } from "./Icons";

export default function NavBar({ githubUrl }: { githubUrl: string }) {
  return (
    <nav
      className="fixed inset-x-0 top-0 z-50 h-[var(--nav-h)] border-b border-gray-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60"
      role="navigation"
      aria-label="Top Navigation"
    >
      <div className="mx-auto px-4 h-full">
        <div className="flex h-full items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2">
              <Image
                src="/postdock.png"
                alt="PostDock Logo"
                width={36}
                height={36}
                className="h-9 w-9 rounded-xl object-cover bg-white border border-gray-200"
                priority
              />
              <span className="font-semibold tracking-tight">PostDock</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full hover:bg-gray-100 transition group"
            >
              <IconGithub className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
