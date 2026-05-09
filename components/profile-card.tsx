import Image from "next/image";
import Link from "next/link";
import type { HTMLAttributes } from "react";

import { profileHighlights } from "@/lib/profile-content";

type ProfileCardProps = {
  className?: string;
  dragHandleProps?: HTMLAttributes<HTMLDivElement>;
  isDragging?: boolean;
  onClose?: () => void;
};

const ctaLinks = [
  { href: "/about", label: "View About" },
  { href: "#resume", label: "Resume" },
  { href: "/#work", label: "Projects" },
] as const;

export function ProfileCard({
  className = "",
  dragHandleProps,
  isDragging = false,
  onClose,
}: ProfileCardProps) {
  return (
    <section
      aria-modal="true"
      className={`max-h-[calc(100svh-1.5rem)] overflow-auto border border-[rgba(72,38,29,0.16)] bg-[rgba(251,248,241,0.98)] text-[var(--atlas-chocolate)] shadow-[0_18px_50px_rgba(72,38,29,0.08)] backdrop-blur-[10px] ${className}`}
      role="dialog"
    >
      <div
        className={`flex items-center justify-between border-b border-[rgba(72,38,29,0.12)] px-4 py-3 sm:px-5 ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        {...dragHandleProps}
      >
        <p className="text-[0.68rem] uppercase tracking-[0.28em]">Profile</p>
        <button
          aria-label="Close profile card"
          className="text-[0.8rem] uppercase tracking-[0.18em] transition-opacity hover:opacity-60"
          onClick={onClose}
          onPointerDown={(event) => event.stopPropagation()}
          type="button"
        >
          Close
        </button>
      </div>

      <div className="grid gap-5 p-4 sm:p-5 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-6 md:p-6">
        <div className="self-start">
          <div className="border border-[rgba(72,38,29,0.14)] p-2">
            <div className="relative aspect-[4/5] overflow-hidden bg-[rgba(72,38,29,0.03)]">
              <Image
                alt="Vivian Glenn portrait"
                className="object-cover object-center"
                fill
                priority
                sizes="(max-width: 767px) calc(100vw - 4rem), 240px"
                src="/vivian-headshot.PNG"
              />
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <h2 className="font-[family-name:var(--font-editorial-serif)] text-[1.85rem] leading-[0.95] tracking-[0.06em] sm:text-[2.1rem]">
            Vivian Glenn
          </h2>
          <p className="mt-3 text-[0.84rem] uppercase tracking-[0.22em]">
            Strategy / Analytics / Systems
          </p>
          <p className="mt-1 text-[0.7rem] uppercase tracking-[0.24em]">
            Public Health @ Rutgers
          </p>

          <div className="mt-5 border-t border-[rgba(72,38,29,0.12)] pt-5">
            <p className="max-w-[36rem] text-[0.95rem] leading-7">
              I focus on turning ambiguous problems into structured, actionable systems.
              My experience spans analytics dashboards, stakeholder research, case
              competition strategy, grant-backed initiative building, and execution across
              fast-moving teams.
            </p>
            <p className="mt-4 max-w-[32rem] text-[0.92rem] leading-7">
              I&apos;m drawn to work that combines problem-solving, operational clarity, and
              measurable impact.
            </p>
          </div>

          <div className="mt-6 border-t border-[rgba(72,38,29,0.12)] pt-4">
            <ul className="grid gap-2 text-[0.76rem] uppercase tracking-[0.16em]">
              {profileHighlights.map((highlight, index) => (
                <li
                  key={highlight}
                  className="grid grid-cols-[1.8rem_minmax(0,1fr)] items-start gap-3 border-b border-[rgba(72,38,29,0.08)] pb-2 last:border-b-0 last:pb-0"
                >
                  <span className="font-[family-name:var(--font-editorial-serif)] text-[0.95rem] leading-none">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="leading-5">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 border-t border-[rgba(72,38,29,0.12)] pt-5">
            {ctaLinks.map((link) => (
              <Link
                key={link.label}
                className="inline-flex items-center border border-[rgba(72,38,29,0.14)] px-3 py-2 text-[0.72rem] uppercase tracking-[0.18em] transition-colors hover:bg-[rgba(72,38,29,0.04)]"
                href={link.href}
                onClick={onClose}
                onPointerDown={(event) => event.stopPropagation()}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
