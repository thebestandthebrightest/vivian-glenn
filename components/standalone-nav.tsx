import Link from "next/link";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#work", label: "Work" },
  { href: "/travel", label: "Travel" },
  { href: "/about", label: "About" },
  { href: "#resume", label: "Resume" },
  { href: "#contact", label: "Contact" },
] as const;

export function StandaloneNav() {
  return (
    <nav className="flex flex-col items-start gap-2 text-[0.72rem] uppercase tracking-[0.2em] text-[var(--atlas-chocolate)]">
      {navLinks.map((link) => (
        <Link
          key={link.label}
          className="inline-flex w-fit border-b border-transparent pb-px transition-colors hover:border-[var(--atlas-chocolate)]"
          href={link.href}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
