"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { travelPlaces, type TravelMediaItem } from "@/lib/travel-data";

import { TravelGlobe } from "./travel-globe";

const BASE_TILE_WIDTH = 176;
const SELECTED_TILE_WIDTH = 272;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function isHeicSource(src: string) {
  return src.toLowerCase().endsWith(".heic");
}

function isMovSource(src: string) {
  return src.toLowerCase().endsWith(".mov");
}

function TravelMedia({
  item,
  isSelected,
  priority = false,
}: {
  item: TravelMediaItem;
  isSelected: boolean;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed || (item.type === "image" && isHeicSource(item.src))) {
    return (
      <div className="flex h-full w-full items-end border border-[rgba(72,38,29,0.12)] bg-[rgba(72,38,29,0.04)] p-4">
        <div>
          <p className="text-[0.6rem] uppercase tracking-[0.24em]">Preview Pending</p>
          <p className="mt-2 text-[0.75rem] leading-5">
            Convert this media to JPG or PNG for full browser support.
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
        preload={isSelected || priority ? "auto" : "metadata"}
      >
        <source src={item.src} type="video/quicktime" />
      </video>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt=""
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
  const [selectedId, setSelectedId] = useState(travelPlaces[0]?.id ?? "");
  const [translateX, setTranslateX] = useState(0);
  const [desktop, setDesktop] = useState(false);

  const selectedPlace =
    travelPlaces.find((place) => place.id === selectedId) ?? travelPlaces[0] ?? null;

  useEffect(() => {
    function updateMode() {
      setDesktop(window.innerWidth >= 960);
    }

    updateMode();
    window.addEventListener("resize", updateMode);
    return () => window.removeEventListener("resize", updateMode);
  }, []);

  useEffect(() => {
    if (!desktop) return;

    let frame = 0;

    const updatePosition = () => {
      frame = 0;

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

      setTranslateX(-maxOffset * progress);
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updatePosition);
    };

    updatePosition();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [desktop, selectedId]);

  const desktopHeight = useMemo(() => `${Math.max(220, travelPlaces.length * 18)}vh`, []);

  return (
    <>
      {selectedPlace ? (
        <TravelGlobe
          label={selectedPlace.label}
          lat={selectedPlace.lat}
          lng={selectedPlace.lng}
        />
      ) : null}

      <main className="min-h-[100svh] bg-[var(--atlas-parchment)] px-4 py-5 text-[var(--atlas-chocolate)] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex items-start justify-between gap-6 border-b border-[rgba(72,38,29,0.12)] pb-6 sm:pb-8">
            <div className="max-w-2xl">
              <p className="text-[0.68rem] uppercase tracking-[0.28em]">Travel / Gallery</p>
              <h1 className="mt-6 font-[family-name:var(--font-editorial-serif)] text-[clamp(2.2rem,6vw,4.5rem)] leading-[0.96] tracking-[0.06em]">
                Places in Motion
              </h1>
              <p className="mt-5 max-w-xl text-[0.95rem] leading-7">
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
            <div className="lg:sticky lg:top-0 lg:flex lg:h-[100svh] lg:items-center">
              <div
                className="overflow-x-auto overflow-y-visible pb-8 pt-10 lg:w-full lg:overflow-hidden lg:pb-0 lg:pt-0"
                ref={viewportRef}
              >
                <div
                  className="flex min-w-max items-end gap-5 pr-6 lg:gap-7 lg:pr-[18vw]"
                  ref={trackRef}
                  style={{
                    transform: desktop ? `translate3d(${translateX}px, 0, 0)` : undefined,
                    transition: desktop ? "transform 180ms ease-out" : undefined,
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
                        onBlur={() => undefined}
                        onClick={() => setSelectedId(place.id)}
                        onFocus={() => setSelectedId(place.id)}
                        onMouseEnter={() => setSelectedId(place.id)}
                        type="button"
                      >
                        <div
                          className="flex flex-col gap-3"
                          style={{
                            width: isSelected ? SELECTED_TILE_WIDTH : BASE_TILE_WIDTH,
                            transition:
                              "width 260ms ease, transform 260ms ease, opacity 260ms ease",
                            transform: `scale(${isSelected ? 1.02 : 1})`,
                            opacity: selectedId === place.id || !selectedPlace ? 1 : 0.72,
                          }}
                        >
                          <div className="relative border border-[rgba(72,38,29,0.12)] bg-[rgba(72,38,29,0.04)]">
                            <div
                              className="overflow-hidden"
                              style={{
                                height: isSelected ? 392 : 252,
                                transition: "height 260ms ease",
                              }}
                            >
                              <TravelMedia
                                key={primaryMedia.id}
                                isSelected={isSelected}
                                item={primaryMedia}
                                priority={index < 3}
                              />
                            </div>
                          </div>

                          {isSelected && extraMedia.length > 0 ? (
                            <div className="grid gap-3">
                              {extraMedia.map((item) => (
                                <div
                                  key={item.id}
                                  className="overflow-hidden border border-[rgba(72,38,29,0.12)] bg-[rgba(72,38,29,0.04)]"
                                  style={{ height: 144 }}
                                >
                                  <TravelMedia key={item.id} isSelected={true} item={item} />
                                </div>
                              ))}
                            </div>
                          ) : null}
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
