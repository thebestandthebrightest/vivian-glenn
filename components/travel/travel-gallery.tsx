"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { StandaloneNav } from "@/components/standalone-nav";
import { travelPlaces, type TravelMediaItem, type TravelPlace } from "@/lib/travel-data";

import { TravelGlobe } from "./travel-globe";

const TILE_WIDTH = 188;
const TILE_HEIGHT = 250;
const STACK_WIDTH = 178;
const STACK_HEIGHT = 238;
const STACK_GAP = 18;
const LOOP_COPIES = 3;
const TRANSITION = "620ms cubic-bezier(0.22, 1, 0.36, 1)";

function getVideoMimeType(src: string) {
  return src.toLowerCase().endsWith(".mp4") ? "video/mp4" : "video/quicktime";
}

function sortPlacesAlphabetically(places: TravelPlace[]) {
  return [...places].sort((first, second) => first.city.localeCompare(second.city));
}

function buildLoopedPlaces(places: TravelPlace[]) {
  return Array.from({ length: LOOP_COPIES }, (_, loopIndex) =>
    places.map((place, orderIndex) => ({
      instanceId: `${loopIndex}-${place.id}`,
      orderIndex,
      place,
    })),
  ).flat();
}

function modulo(value: number, base: number) {
  return ((value % base) + base) % base;
}

function VideoFallback() {
  return (
    <div className="flex h-full w-full items-end bg-[rgba(17,17,17,0.03)] p-4">
      <div>
        <p className="text-[0.6rem] uppercase tracking-[0.24em]">Preview Unavailable</p>
        <p className="mt-2 max-w-[11rem] text-[0.75rem] leading-5">
          Video preview unavailable — convert MOV to MP4 for browser playback.
        </p>
      </div>
    </div>
  );
}

function ImageFallback() {
  return (
    <div className="flex h-full w-full items-end bg-[rgba(17,17,17,0.03)] p-4">
      <div>
        <p className="text-[0.6rem] uppercase tracking-[0.24em]">Media Missing</p>
        <p className="mt-2 max-w-[11rem] text-[0.75rem] leading-5">
          Add or rename this file in the travel folder to restore the archive tile.
        </p>
      </div>
    </div>
  );
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
  const [imageFailed, setImageFailed] = useState(false);
  const [videoPreviewFailed, setVideoPreviewFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (item.type !== "video") return;

    const video = videoRef.current;
    if (!video) return;

    if (isSelected) {
      void video.play().catch(() => {
        /* autoplay can be blocked; muted loop will retry on interaction */
      });
    }
  }, [isSelected, item.type]);

  if (item.type === "video") {
    if (videoPreviewFailed) {
      return <VideoFallback />;
    }

    return (
      <video
        ref={videoRef}
        autoPlay
        className="h-full w-full object-cover"
        loop
        muted
        onError={() => setVideoPreviewFailed(true)}
        playsInline
        preload="auto"
      >
        <source src={item.src} type={getVideoMimeType(item.src)} />
      </video>
    );
  }

  if (imageFailed) {
    return <ImageFallback />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      className="h-full w-full object-cover"
      loading={priority ? "eager" : "lazy"}
      onError={() => setImageFailed(true)}
      src={item.src}
    />
  );
}

export function TravelGallery() {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const virtualOffsetRef = useRef(0);
  const currentOffsetRef = useRef(0);
  const segmentWidthRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [desktop, setDesktop] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const [entered, setEntered] = useState(false);

  const orderedPlaces = useMemo(() => sortPlacesAlphabetically(travelPlaces), []);
  const loopedPlaces = useMemo(() => buildLoopedPlaces(orderedPlaces), [orderedPlaces]);
  const selectedEntry =
    selectedInstanceId === null
      ? null
      : loopedPlaces.find((entry) => entry.instanceId === selectedInstanceId) ?? null;
  const selectedPlace = selectedEntry?.place ?? null;

  useEffect(() => {
    const timer = window.setTimeout(() => setEntered(true), 40);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    function updateMode() {
      const nextDesktop = window.innerWidth >= 960;
      setDesktop(nextDesktop);

      if (!nextDesktop) {
        virtualOffsetRef.current = 0;
        currentOffsetRef.current = 0;
        segmentWidthRef.current = 0;
        setTranslateX(0);
      }
    }

    updateMode();
    window.addEventListener("resize", updateMode);
    return () => window.removeEventListener("resize", updateMode);
  }, []);

  useEffect(() => {
    if (!desktop) return;

    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const updateMetrics = () => {
      segmentWidthRef.current = track.scrollWidth / LOOP_COPIES;
      setTranslateX(-segmentWidthRef.current - modulo(currentOffsetRef.current, segmentWidthRef.current));
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      const dominantDelta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      virtualOffsetRef.current += dominantDelta * 0.34;
    };

    const animate = () => {
      currentOffsetRef.current +=
        (virtualOffsetRef.current - currentOffsetRef.current) * 0.06;

      const segmentWidth = segmentWidthRef.current;
      if (segmentWidth > 0) {
        setTranslateX(-segmentWidth - modulo(currentOffsetRef.current, segmentWidth));
      }

      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    const resizeObserver = new ResizeObserver(() => updateMetrics());
    resizeObserver.observe(viewport);
    resizeObserver.observe(track);

    updateMetrics();
    viewport.addEventListener("wheel", handleWheel, { passive: false });
    animationFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      viewport.removeEventListener("wheel", handleWheel);
      resizeObserver.disconnect();
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [desktop, loopedPlaces.length]);

  return (
    <>
      <TravelGlobe
        city={selectedPlace?.city ?? "Travel Archive"}
        country={selectedPlace?.country ?? ""}
        lat={selectedPlace?.lat ?? 0}
        lng={selectedPlace?.lng ?? 0}
        neutral={selectedPlace === null}
      />

      <main className="flex h-[100svh] min-h-[100svh] flex-col overflow-hidden overscroll-none bg-[var(--atlas-parchment)] px-4 py-4 text-[var(--atlas-chocolate)] sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col">
          <header className="flex items-start justify-between gap-6 border-b border-[rgba(17,17,17,0.12)] pb-4">
            <p className="text-[0.68rem] uppercase tracking-[0.28em]">Travel / Gallery</p>
            <StandaloneNav />
          </header>

          <section className="flex flex-1 items-center overflow-hidden py-6 lg:py-8">
            <div
              className="w-full overflow-x-auto overflow-y-hidden pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:overflow-hidden"
              ref={viewportRef}
            >
              <div
                className="flex min-w-max items-end gap-[34px] pr-[16vw]"
                ref={trackRef}
                style={{
                  transform: desktop ? `translate3d(${translateX}px, 0, 0)` : undefined,
                  willChange: desktop ? "transform" : undefined,
                }}
              >
                {loopedPlaces.map((entry, index) => {
                  const { instanceId, orderIndex, place } = entry;
                  const isSelected = selectedInstanceId === instanceId;
                  const primaryMedia = place.media[0];
                  const extraMedia = place.media.slice(1);

                  return (
                    <button
                      key={instanceId}
                      className="group flex shrink-0 flex-col items-start bg-transparent text-left"
                      onClick={() => setSelectedInstanceId(instanceId)}
                      onFocus={() => setSelectedInstanceId(instanceId)}
                      onMouseEnter={() => setSelectedInstanceId(instanceId)}
                      type="button"
                    >
                      <div
                        className="relative"
                        style={{
                          width: TILE_WIDTH,
                          height:
                            TILE_HEIGHT + extraMedia.length * (STACK_HEIGHT + STACK_GAP) + 18,
                          opacity: selectedInstanceId === null || isSelected ? 1 : 0.78,
                          transform: entered ? "translate3d(0, 0, 0)" : "translate3d(0, 18px, 0)",
                          transition: `opacity ${TRANSITION}, transform ${TRANSITION}`,
                          transitionDelay: entered
                            ? `${Math.min(orderIndex, 8) * 28}ms`
                            : "0ms",
                        }}
                      >
                        {extraMedia.map((item, extraIndex) => (
                          <div
                            key={item.id}
                            className="absolute left-1/2 top-0 overflow-hidden"
                            style={{
                              width: STACK_WIDTH,
                              height: STACK_HEIGHT,
                              opacity: isSelected ? 1 : 0,
                              transform: isSelected
                                ? `translate3d(-50%, ${extraIndex * (STACK_HEIGHT + STACK_GAP)}px, 0)`
                                : "translate3d(-50%, 28px, 0)",
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
                        ))}

                        <div
                          className="absolute bottom-0 left-0 origin-bottom overflow-hidden"
                          style={{
                            width: TILE_WIDTH,
                            height: TILE_HEIGHT,
                            transform: isSelected ? "scale(1.08)" : "scale(1)",
                            transition: `transform ${TRANSITION}, opacity ${TRANSITION}, filter ${TRANSITION}`,
                            filter: isSelected ? "saturate(1) contrast(1)" : "saturate(0.95)",
                          }}
                        >
                          <TravelMedia
                            alt={place.label}
                            isSelected={isSelected}
                            item={primaryMedia}
                            priority={index < orderedPlaces.length}
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
          </section>
        </div>
      </main>
    </>
  );
}
