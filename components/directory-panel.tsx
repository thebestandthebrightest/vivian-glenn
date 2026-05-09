import Link from "next/link";

const directoryLinks = [
  { href: "/#work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "#resume", label: "Resume" },
  { href: "#contact", label: "Contact" },
] as const;

export function DirectoryPanel() {
  return (
    <aside className="absolute left-4 top-4 z-30 w-[min(15.75rem,calc(100vw-2rem))] border border-[rgba(72,38,29,0.18)] bg-[rgba(248,243,234,0.78)] px-4 py-3 text-[var(--atlas-chocolate)] backdrop-blur-[3px] sm:left-6 sm:top-6 sm:px-5 sm:py-4">
      <div className="border-b border-[rgba(72,38,29,0.22)] pb-3">
        <p className="font-[family-name:var(--font-editorial-serif)] text-[0.92rem] uppercase tracking-[0.2em]">
          Vivian Glenn
        </p>
        <p className="mt-2 text-[0.68rem] uppercase tracking-[0.28em]">
          Public Health @ Rutgers
        </p>
        <p className="mt-1 text-[0.68rem] uppercase tracking-[0.28em]">
          Systems / Strategy / Design
        </p>
      </div>
      <nav className="mt-3 flex flex-col gap-2 text-[0.77rem] uppercase tracking-[0.18em]">
        {directoryLinks.map((link) => (
          <Link
            key={link.label}
            className="inline-flex w-fit border-b border-transparent pb-px transition-colors hover:border-[var(--atlas-chocolate)]"
            href={link.href}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
