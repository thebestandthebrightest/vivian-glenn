"use client";

type TravelGlobeProps = {
  city: string;
  country: string;
  lat: number;
  lng: number;
};

function projectToGlobe(lat: number, lng: number) {
  const lambda = (lng * Math.PI) / 180;
  const phi = (lat * Math.PI) / 180;
  const x = Math.cos(phi) * Math.sin(lambda) * 24;
  const y = Math.sin(phi) * -22;

  return {
    x: Math.max(18, Math.min(82, 50 + x)),
    y: Math.max(24, Math.min(76, 50 + y)),
  };
}

export function TravelGlobe({ city, country, lat, lng }: TravelGlobeProps) {
  const marker = projectToGlobe(lat, lng);

  return (
    <aside className="pointer-events-none fixed right-5 top-5 z-20 hidden text-[var(--atlas-chocolate)] md:block lg:right-8 lg:top-8">
      <div className="border border-[rgba(17,17,17,0.12)] bg-[rgba(252,251,247,0.92)] px-4 py-3 backdrop-blur-[2px]">
        <p className="text-[0.62rem] uppercase tracking-[0.28em]">Travel Marker</p>
        <div className="mt-3">
          <svg
            aria-hidden="true"
            className="h-24 w-24 rotate-[-12deg]"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              fill="none"
              r="42"
              stroke="rgba(17,17,17,0.18)"
              strokeWidth="1"
            />
            <ellipse
              cx="50"
              cy="50"
              fill="none"
              rx="30"
              ry="42"
              stroke="rgba(17,17,17,0.12)"
              strokeWidth="1"
            />
            <ellipse
              cx="50"
              cy="50"
              fill="none"
              rx="14"
              ry="42"
              stroke="rgba(17,17,17,0.12)"
              strokeWidth="1"
            />
            <path
              d="M12 50H88M18 34H82M18 66H82"
              fill="none"
              stroke="rgba(17,17,17,0.12)"
              strokeWidth="1"
            />
            <circle cx={marker.x} cy={marker.y} fill="var(--atlas-sun)" r="3.4" />
          </svg>
        </div>
        <div className="mt-3">
          <p className="font-[family-name:var(--font-editorial-serif)] text-[0.82rem] leading-5">
            {city}
          </p>
          {country ? (
            <p className="mt-1 text-[0.62rem] uppercase leading-5 tracking-[0.2em]">
              {country}
            </p>
          ) : null}
        </div>
      </div>
      {/* TODO: Replace this placeholder projection with a more precise globe route map if needed. */}
    </aside>
  );
}
