"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { travelPlaces, type TravelMediaItem } from "@/lib/travel-data";

import { TravelGlobe } from "./travel-globe";

const TILE_WIDTH = 184;
const TILE_HEIGHT = 264;
const STACK_TILE_HEIGHT = 124;
const MEDIA_STACK_SPACE = 292;
const TRANSITION = "600ms cubic-bezier(0.22, 1, 0.36, 1)";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function isMovSource(src: string) {
  return src.toLowerCase().endsWith(".mov");
}

function TravelMedia({
  alt,
  item,
  isSelected,
  priority = false,
}: {
  alt: string;
  item: TravelMediaItem;
  isSelected: boolean;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex h-full w-full items-end border border-[rgba(72,38,29,0.12)] bg-[rgba(72,38,29,0.04)] p-4">
        <div>
          <p className="text-[0.6rem] uppercase tracking-[0.24em]">Media Missing</p>
          <p className="mt-2 text-[0.75rem] leading-5">
            Add or rename this file in the travel folder to restore the archive tile.
          </p>
        </div>
      </div>
    );
  }

  if (item.type === "video" || isMovSource(item.src)) {
    return (
      <video
        autoPlay={isSelected}
        className="h-full w-full object-cover"
        loop
        muted
        onError={() => setFailed(true)}
        playsInline
        poster={item.posterSrc}
        preload={isSelected || priority ? "auto" : "metadata"}
      >
        <source src={item.src} type="video/quicktime" />
      </video>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      className="h-full w-full object-cover"
      loading={priority ? "eager" : "lazy"}
      onError={() => setFailed(true)}
      src={item.src}
    />
  );
}

export function TravelGallery() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const currentTranslateRef = useRef(0);
  const targetTranslateRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const [selectedId, setSelectedId] = useState(travelPlaces[0]?.id ?? "");
  const [desktop, setDesktop] = useState(false);
  const [translateX, setTranslateX] = useState(0);

  const selectedPlace =
    travelPlaces.find((place) => place.id === selectedId) ?? travelPlaces[0] ?? null;

  useEffect(() => {
    function updateMode() {
      const nextDesktop = window.innerWidth >= 960;
      setDesktop(nextDesktop);

      if (!nextDesktop) {
        currentTranslateRef.current = 0;
        targetTranslateRef.current = 0;
        setTranslateX(0);
      }
    }

    updateMode();
    window.addEventListener("resize", updateMode);
    return () => window.removeEventListener("resize", updateMode);
  }, []);

  useEffect(() => {
    if (!desktop) return;

    const updateTarget = () => {
      const section = sectionRef.current;
      const viewport = viewportRef.current;
      const track = trackRef.current;
      if (!section || !viewport || !track) return;

      const sectionRect = section.getBoundingClientRect();
      const viewportWidth = viewport.clientWidth;
      const trackWidth = track.scrollWidth;
      const maxOffset = Math.max(0, trackWidth - viewportWidth);
      const scrollableHeight = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = clamp(-sectionRect.top / scrollableHeight, 0, 1);

      targetTranslateRef.current = -maxOffset * progress * 0.82;
    };

    const animate = () => {
      currentTranslateRef.current +=
        (targetTranslateRef.current - currentTranslateRef.current) * 0.08;

      if (Math.abs(targetTranslateRef.current - currentTranslateRef.current) < 0.08) {
        currentTranslateRef.current = targetTranslateRef.current;
      }

      setTranslateX(currentTranslateRef.current);
      frameRef.current = window.requestAnimationFrame(animate);
    };

    updateTarget();
    frameRef.current = window.requestAnimationFrame(animate);
    window.addEventListener("scroll", updateTarget, { passive: true });
    window.addEventListener("resize", updateTarget);

    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener("scroll", updateTarget);
      window.removeEventListener("resize", updateTarget);
    };
  }, [desktop]);

  const desktopHeight = useMemo(() => `${Math.max(240, travelPlaces.length * 24)}vh`, []);

  return (
    <>
      {selectedPlace ? (
        <TravelGlobe
          label={selectedPlace.label}
          lat={selectedPlace.lat}
          lng={selectedPlace.lng}
        />
      ) : null}

      <main className="min-h-[100svh] bg-[var(--atlas-parchment)] px-4 py-4 text-[var(--atlas-chocolate)] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex items-start justify-between gap-6 border-b border-[rgba(72,38,29,0.12)] pb-5 sm:pb-6">
            <div className="max-w-2xl">
              <p className="text-[0.68rem] uppercase tracking-[0.28em]">Travel / Gallery</p>
              <h1 className="mt-4 font-[family-name:var(--font-editorial-serif)] text-[clamp(2.2rem,6vw,4.5rem)] leading-[0.96] tracking-[0.06em]">
                Places in Motion
              </h1>
              <p className="mt-4 max-w-xl text-[0.95rem] leading-7">
                A visual archive of cities, coastlines, and in-between moments, arranged
                as a scrolling map of where I&apos;ve been.
              </p>
            </div>
            <Link
              className="text-[0.72rem] uppercase tracking-[0.18em] transition-opacity hover:opacity-65"
              href="/"
            >
              Back Home
            </Link>
          </header>

          <section
            className="relative"
            ref={sectionRef}
            style={{ height: desktop ? desktopHeight : "auto" }}
          >
            <div className="lg:sticky lg:top-0 lg:flex lg:h-[100svh] lg:items-start">
              <div
                className="overflow-x-auto overflow-y-visible pb-8 pt-8 lg:w-full lg:overflow-hidden lg:pb-0 lg:pt-16"
                ref={viewportRef}
              >
                <div
                  className="flex min-w-max items-end gap-5 pr-6 lg:gap-8 lg:pr-[18vw]"
                  ref={trackRef}
                  style={{
                    transform: desktop ? `translate3d(${translateX}px, 0, 0)` : undefined,
                  }}
                >
                  {travelPlaces.map((place, index) => {
                    const isSelected = selectedId === place.id;
                    const primaryMedia = place.media[0];
                    const extraMedia = place.media.slice(1);

                    return (
                      <button
                        key={place.id}
                        className="group flex shrink-0 flex-col items-start bg-transparent text-left"
                        onClick={() => setSelectedId(place.id)}
                        onFocus={() => setSelectedId(place.id)}
                        onMouseEnter={() => setSelectedId(place.id)}
                        type="button"
                      >
                        <div
                          className="relative"
                          style={{
                            width: TILE_WIDTH,
                            height: MEDIA_STACK_SPACE + TILE_HEIGHT,
                            opacity: selectedId === place.id || !selectedPlace ? 1 : 0.7,
                            transition: `opacity ${TRANSITION}`,
                          }}
                        >
                          {extraMedia.map((item, extraIndex) => {
                            const reverseIndex = extraMedia.length - extraIndex;

                            return (
                              <div
                                key={item.id}
                                className="absolute left-0 overflow-hidden border border-[rgba(72,38,29,0.12)] bg-[rgba(72,38,29,0.04)]"
                                style={{
                                  bottom: TILE_HEIGHT + 16 + (reverseIndex - 1) * (STACK_TILE_HEIGHT + 12),
                                  width: TILE_WIDTH,
                                  height: STACK_TILE_HEIGHT,
                                  opacity: isSelected ? 1 : 0,
                                  transform: isSelected
                                    ? "translate3d(0, 0, 0)"
                                    : "translate3d(0, 18px, 0)",
                                  transition: `opacity ${TRANSITION}, transform ${TRANSITION}`,
                                  pointerEvents: "none",
                                }}
                              >
                                <TravelMedia
                                  alt={`${place.label} detail ${extraIndex + 2}`}
                                  isSelected={isSelected}
                                  item={item}
                                />
                              </div>
                            );
                          })}

                          <div
                            className="absolute bottom-0 left-0 origin-bottom overflow-hidden border border-[rgba(72,38,29,0.12)] bg-[rgba(72,38,29,0.04)]"
                            style={{
                              width: TILE_WIDTH,
                              height: TILE_HEIGHT,
                              transform: isSelected ? "scale(1.14)" : "scale(1)",
                              transition: `transform ${TRANSITION}, filter ${TRANSITION}, opacity ${TRANSITION}`,
                              filter: isSelected ? "saturate(1) contrast(1)" : "saturate(0.92)",
                              zIndex: isSelected ? 2 : 1,
                            }}
                          >
                            <TravelMedia
                              alt={place.label}
                              isSelected={isSelected}
                              item={primaryMedia}
                              priority={index < 3}
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="font-[family-name:var(--font-editorial-serif)] text-[1rem] leading-6">
                            {place.city}
                          </p>
                          {place.country ? (
                            <p className="mt-1 text-[0.68rem] uppercase tracking-[0.22em]">
                              {place.country}
                            </p>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
