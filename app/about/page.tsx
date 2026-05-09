import Image from "next/image";
import Link from "next/link";

import { aboutExperience, aboutHighlights, skillGroups } from "@/lib/profile-content";

export default function AboutPage() {
  const majorRule = "border-[rgba(72,38,29,0.12)]";
  const minorRule = "border-[rgba(72,38,29,0.08)]";

  return (
    <main className="min-h-[100svh] bg-[var(--atlas-parchment)] px-4 py-6 text-[var(--atlas-chocolate)] sm:px-6 lg:px-8">
      <div className={`mx-auto max-w-6xl border bg-[rgba(251,248,241,0.88)] ${majorRule}`}>
        <header className={`grid gap-0 border-b lg:grid-cols-[minmax(0,1.15fr)_22rem] ${majorRule}`}>
          <div className="px-6 py-8 sm:px-8 sm:py-10">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[0.7rem] uppercase tracking-[0.28em]">About</p>
              <Link
                className="text-[0.72rem] uppercase tracking-[0.18em] transition-opacity hover:opacity-65"
                href="/"
              >
                Back Home
              </Link>
            </div>

            <h1 className="mt-10 font-[family-name:var(--font-editorial-serif)] text-[clamp(2.8rem,8vw,5.6rem)] leading-[0.92] tracking-[0.08em]">
              Vivian Glenn
            </h1>
            <p className="mt-5 text-[0.9rem] uppercase tracking-[0.22em]">
              Strategy / Analytics / Systems
            </p>
            <p className="mt-2 text-[0.72rem] uppercase tracking-[0.24em]">
              Public Health @ Rutgers · New Jersey
            </p>
            <p className="mt-8 max-w-2xl text-[1rem] leading-8">
              I&apos;m interested in how strong strategy turns ambitious ideas into systems
              that actually work. My work sits across public health, analytics, research,
              design, and execution, with a focus on turning ambiguity into structure and
              insight into action.
            </p>
          </div>

          <div className={`border-t px-6 py-6 sm:px-8 sm:py-8 lg:border-l lg:border-t-0 ${majorRule}`}>
            <div className={`mx-auto max-w-[22rem] border p-3 ${majorRule}`}>
              <div className="relative aspect-[4/5] overflow-hidden bg-[rgba(72,38,29,0.03)]">
                <Image
                  alt="Vivian Glenn portrait"
                  className="object-cover object-center"
                  fill
                  priority
                  sizes="(max-width: 1023px) min(100vw - 4rem, 24rem), 320px"
                  src="/vivian-headshot.PNG"
                />
              </div>
            </div>
          </div>
        </header>

        <div className="px-6 py-8 sm:px-8 sm:py-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,21rem)] lg:gap-10">
            <div className="min-w-0">
              <section className={`border-b pb-8 ${majorRule}`}>
                <p className="text-[0.72rem] uppercase tracking-[0.28em]">01 — Profile</p>
                <p className="mt-5 max-w-3xl text-[0.98rem] leading-8">
                  I focus on complex, people-centered problems where strategy, operations,
                  research, and data have to work together. My experience combines
                  analytics dashboards, stakeholder research, case strategy, grant-backed
                  execution, teaching, and public health research into one consistent
                  focus: turning ambiguity into structure and insight into action.
                </p>
              </section>

              <section className="pt-8">
                <p className="text-[0.72rem] uppercase tracking-[0.28em]">
                  02 — Selected Experience
                </p>
                <div className="mt-6 grid gap-0">
                  {aboutExperience.map((item) => (
                    <div
                      key={item.title}
                      className={`grid gap-3 border-t py-5 first:border-t-0 first:pt-0 lg:grid-cols-[minmax(15rem,20rem)_minmax(0,1fr)] lg:gap-5 ${minorRule}`}
                    >
                      <h2 className="font-[family-name:var(--font-editorial-serif)] text-[1.12rem] leading-6">
                        {item.title}
                      </h2>
                      <p className="max-w-3xl text-[0.95rem] leading-7">{item.body}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className={`self-start lg:border-l lg:pl-8 ${majorRule}`}>
              <section className="pb-8">
                <p className="text-[0.72rem] uppercase tracking-[0.28em]">03 — Highlights</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  {aboutHighlights.map((highlight) => (
                    <div
                      key={highlight}
                      className="border border-[rgba(72,38,29,0.1)] px-4 py-3 text-[0.74rem] uppercase tracking-[0.16em]"
                    >
                      {highlight}
                    </div>
                  ))}
                </div>
              </section>
            </aside>
          </div>

          <div className="mt-8 max-w-[calc(100%-0rem)] lg:max-w-[calc(100%-18rem-2.5rem)]">
            <section className={`border-t py-8 ${majorRule}`}>
              <p className="text-[0.72rem] uppercase tracking-[0.28em]">04 — Skills</p>
              <div className="mt-5 grid items-start gap-x-6 gap-y-6 md:grid-cols-2">
                {skillGroups.map((group, index) => (
                  <div
                    key={group.title}
                    className={`self-start ${index === skillGroups.length - 1 ? "md:col-span-2 md:max-w-[calc(50%-0.75rem)]" : ""}`}
                  >
                    <h3 className="text-[0.8rem] uppercase tracking-[0.2em]">{group.title}</h3>
                    <p className="mt-3 text-[0.92rem] leading-7">{group.items.join(", ")}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className={`border-t pt-8 ${majorRule}`}>
              <p className="text-[0.72rem] uppercase tracking-[0.28em]">05 — Interests</p>
              <p className="mt-5 text-[0.96rem] leading-7">
                Ceramics, baking, cycling, travel, photography.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
