import { DirectoryPanel } from "./directory-panel";
import { FloatingEcosystemMap, type ProtectedZone } from "./floating-ecosystem-map";

const protectedZones: ProtectedZone[] = [
  {
    id: "legend",
    desktop: { x: 0.02, y: 0.025, width: 0.22, height: 0.2 },
    mobile: { x: 0.03, y: 0.02, width: 0.68, height: 0.16 },
  },
  {
    id: "title",
    desktop: { x: 0.03, y: 0.63, width: 0.32, height: 0.22 },
    mobile: { x: 0.08, y: 0.19, width: 0.84, height: 0.18 },
  },
];

export function HomePage() {
  return (
    <main
      className="relative h-[100svh] min-h-[100svh] overflow-hidden bg-[var(--atlas-parchment)] text-[var(--atlas-chocolate)]"
      id="work"
    >
      <FloatingEcosystemMap protectedZones={protectedZones} />
      <DirectoryPanel />
    </main>
  );
}
