"use client";

import { motion } from "framer-motion";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { ecosystemNodes, type EcosystemNodeBlueprint } from "@/lib/ecosystem-data";

import { ProfileCard } from "./profile-card";

type Size = {
  width: number;
  height: number;
};

export type ProtectedZone = {
  id: string;
  desktop: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  mobile: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

type ZoneRect = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type SimNode = {
  blueprint: EcosystemNodeBlueprint;
  x: number;
  y: number;
  vx: number;
  vy: number;
  homeX: number;
  homeY: number;
  preferredDistance: number;
};

type HubState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  homeX: number;
  homeY: number;
};

type SceneNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  labelWidth: number;
  labelSide: EcosystemNodeBlueprint["labelSide"];
  color: string;
  curveSide: 1 | -1;
  curveStrength: number;
  curveDrift: number;
  curvePhase: number;
};

type SceneSnapshot = {
  hub: {
    x: number;
    y: number;
  };
  nodes: SceneNode[];
  curveRelax: number;
  time: number;
};

type DragState = {
  pointerId: number;
  offsetX: number;
  offsetY: number;
  lastClientX: number;
  lastClientY: number;
  lastTimestamp: number;
  startClientX: number;
  startClientY: number;
  moved: boolean;
};

type PopupPosition = {
  x: number;
  y: number;
};

type PopupDragState = {
  pointerId: number;
  offsetX: number;
  offsetY: number;
};

const SPOKE_DIAMETER = 16;
const SPOKE_RADIUS = SPOKE_DIAMETER / 2;
const POPUP_DESKTOP_WIDTH = 700;
const POPUP_MOBILE_MAX_WIDTH = 430;
const POPUP_ESTIMATED_DESKTOP_HEIGHT = 500;
const POPUP_ESTIMATED_MOBILE_HEIGHT = 680;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getViewportPadding(mobile: boolean) {
  return mobile ? 14 : 24;
}

function getPopupDimensions(width: number, height: number, mobile: boolean) {
  const padding = getViewportPadding(mobile);

  return {
    width: mobile
      ? Math.max(280, Math.min(POPUP_MOBILE_MAX_WIDTH, width - padding * 2))
      : Math.min(POPUP_DESKTOP_WIDTH, Math.max(520, width - padding * 2)),
    height: mobile
      ? Math.min(POPUP_ESTIMATED_MOBILE_HEIGHT, height - padding * 2)
      : Math.min(POPUP_ESTIMATED_DESKTOP_HEIGHT, height - padding * 2),
  };
}

function clampPopupPosition(
  position: PopupPosition,
  width: number,
  height: number,
  cardWidth: number,
  cardHeight: number,
  mobile: boolean,
) {
  const padding = getViewportPadding(mobile);

  return {
    x: clamp(position.x, padding, Math.max(padding, width - cardWidth - padding)),
    y: clamp(position.y, padding, Math.max(padding, height - cardHeight - padding)),
  };
}

function getInitialPopupPosition(
  hubX: number,
  hubY: number,
  width: number,
  height: number,
  cardWidth: number,
  cardHeight: number,
  mobile: boolean,
) {
  if (mobile) {
    return clampPopupPosition(
      {
        x: width / 2 - cardWidth / 2,
        y: height / 2 - cardHeight / 2,
      },
      width,
      height,
      cardWidth,
      cardHeight,
      mobile,
    );
  }

  const horizontalGap = 40;
  const rightCandidate = hubX + horizontalGap;
  const leftCandidate = hubX - cardWidth - horizontalGap;
  const prefersRight = rightCandidate + cardWidth <= width - getViewportPadding(false);
  const desiredX = prefersRight ? rightCandidate : leftCandidate;

  return clampPopupPosition(
    {
      x: desiredX,
      y: hubY - cardHeight * 0.46,
    },
    width,
    height,
    cardWidth,
    cardHeight,
    mobile,
  );
}

function resolveZones(
  zones: ProtectedZone[],
  mobile: boolean,
  width: number,
  height: number,
): ZoneRect[] {
  return zones.map((zone) => {
    const source = mobile ? zone.mobile : zone.desktop;

    return {
      id: zone.id,
      x: source.x * width,
      y: source.y * height,
      width: source.width * width,
      height: source.height * height,
    };
  });
}

function measureLabelHeight(label: string) {
  return label.split("\n").length * 15;
}

function getNodeSafePadding(node: SimNode) {
  const labelGap = 18;
  const labelHeight = measureLabelHeight(node.blueprint.label);
  const left =
    node.blueprint.labelSide === "left"
      ? node.blueprint.labelWidth + SPOKE_RADIUS + labelGap + 18
      : SPOKE_RADIUS + 20;
  const right =
    node.blueprint.labelSide === "right"
      ? node.blueprint.labelWidth + SPOKE_RADIUS + labelGap + 18
      : SPOKE_RADIUS + 20;
  const top = SPOKE_RADIUS + 24;
  const bottom =
    node.blueprint.labelSide === "bottom"
      ? SPOKE_RADIUS + labelHeight + labelGap + 24
      : SPOKE_RADIUS + 24;

  return { left, right, top, bottom };
}

function extractScene(
  hub: HubState,
  nodes: SimNode[],
  curveRelax: number,
  time: number,
): SceneSnapshot {
  return {
    hub: {
      x: hub.x,
      y: hub.y,
    },
    nodes: nodes.map((node) => ({
      id: node.blueprint.id,
      label: node.blueprint.label,
      x: node.x,
      y: node.y,
      labelWidth: node.blueprint.labelWidth,
      labelSide: node.blueprint.labelSide,
      color: node.blueprint.color,
      curveSide: node.blueprint.curveSide,
      curveStrength: node.blueprint.curveStrength,
      curveDrift: node.blueprint.curveDrift,
      curvePhase: node.blueprint.curvePhase,
    })),
    curveRelax,
    time,
  };
}

function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new ResizeObserver(([entry]) => {
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, size };
}

function HubSun({ size }: { size: number }) {
  const center = 24;
  const innerRadius = 7.5;
  const outerRadius = 16.5;
  const rays = 10;

  return (
    <svg aria-hidden="true" height={size} viewBox="0 0 48 48" width={size}>
      {Array.from({ length: rays }, (_, index) => {
        const angle = (Math.PI * 2 * index) / rays - Math.PI / 2;
        const x1 = center + Math.cos(angle) * innerRadius;
        const y1 = center + Math.sin(angle) * innerRadius;
        const x2 = center + Math.cos(angle) * outerRadius;
        const y2 = center + Math.sin(angle) * outerRadius;

        return (
          <line
            key={index}
            stroke="var(--atlas-sun)"
            strokeLinecap="round"
            strokeWidth="1.8"
            x1={x1}
            x2={x2}
            y1={y1}
            y2={y2}
          />
        );
      })}
      <circle
        cx={center}
        cy={center}
        fill="var(--atlas-sun)"
        r="5.5"
        stroke="var(--atlas-sun)"
        strokeWidth="1.2"
      />
    </svg>
  );
}

export function FloatingEcosystemMap({
  protectedZones,
}: {
  protectedZones: ProtectedZone[];
}) {
  const { ref: stageRef, size } = useElementSize<HTMLDivElement>();
  const [scene, setScene] = useState<SceneSnapshot | null>(null);
  const hubRef = useRef<HubState | null>(null);
  const nodesRef = useRef<SimNode[]>([]);
  const dragStateRef = useRef<DragState | null>(null);
  const popupDragStateRef = useRef<PopupDragState | null>(null);
  const hubButtonRef = useRef<HTMLButtonElement | null>(null);
  const profileCardRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const curveRelaxRef = useRef(1);
  const timeRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isProfileDragging, setIsProfileDragging] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [popupPosition, setPopupPosition] = useState<PopupPosition | null>(null);

  const width = size.width || 1280;
  const height = size.height || 820;
  const mobile = width < 768;
  const activeTarget = isProfileOpen ? "hub" : hoveredNode;
  const popupDimensions = useMemo(
    () => getPopupDimensions(width, height, mobile),
    [height, mobile, width],
  );
  const resolvedZones = useMemo(
    () => resolveZones(protectedZones, mobile, width, height),
    [height, mobile, protectedZones, width],
  );
  const visibleBlueprints = useMemo(
    () => ecosystemNodes.filter((node) => !(mobile && node.hideOnMobile)),
    [mobile],
  );

  useEffect(() => {
    if (!width || !height) return;

    const hubHome = {
      x: width * (mobile ? 0.56 : 0.58),
      y: height * (mobile ? 0.58 : 0.5),
    };

    const hub: HubState = {
      x: hubHome.x,
      y: hubHome.y,
      vx: mobile ? 0.12 : 0.18,
      vy: mobile ? -0.1 : 0.08,
      homeX: hubHome.x,
      homeY: hubHome.y,
    };

    const nodes = visibleBlueprints.map((blueprint, index) => {
      const homeX =
        width *
        (mobile && blueprint.mobileHomeX !== undefined
          ? blueprint.mobileHomeX
          : blueprint.homeX);
      const homeY =
        height *
        (mobile && blueprint.mobileHomeY !== undefined
          ? blueprint.mobileHomeY
          : blueprint.homeY);
      const offset = index % 2 === 0 ? 14 : -14;
      const distanceToHub = Math.hypot(homeX - hubHome.x, homeY - hubHome.y);

      return {
        blueprint,
        x: homeX + offset,
        y: homeY - offset * 0.35,
        vx: ((index % 3) - 1) * 0.16,
        vy: ((index % 4) - 1.5) * 0.13,
        homeX,
        homeY,
        preferredDistance: distanceToHub,
      };
    });

    hubRef.current = hub;
    nodesRef.current = nodes;
  }, [height, mobile, visibleBlueprints, width]);

  useEffect(() => {
    if (!hubRef.current || nodesRef.current.length === 0) return;

    let frameId = 0;
    let lastTime = performance.now();
    const bounce = 0.76;
    const maxHubSpeed = mobile ? 0.45 : 0.62;
    const maxNodeSpeed = mobile ? 0.6 : 0.78;

    const tick = (time: number) => {
      const hub = hubRef.current;
      if (!hub) return;

      const dt = clamp((time - lastTime) / 16.6667, 0.7, 1.8);
      lastTime = time;
      timeRef.current = time / 1000;
      const curveTarget = isDraggingRef.current ? 0 : 1;
      curveRelaxRef.current += (curveTarget - curveRelaxRef.current) * 0.08 * dt;

      if (!isDraggingRef.current) {
        hub.vx += (hub.homeX - hub.x) * 0.00034 * dt;
        hub.vy += (hub.homeY - hub.y) * 0.00034 * dt;
        hub.vx += (Math.random() - 0.5) * 0.018 * dt;
        hub.vy += (Math.random() - 0.5) * 0.018 * dt;
        hub.vx *= 0.992;
        hub.vy *= 0.992;

        const hubSpeed = Math.hypot(hub.vx, hub.vy);
        if (hubSpeed > maxHubSpeed) {
          const scale = maxHubSpeed / hubSpeed;
          hub.vx *= scale;
          hub.vy *= scale;
        }

        hub.x += hub.vx * dt;
        hub.y += hub.vy * dt;
      }

      const hubPadding = mobile ? 34 : 42;
      if (hub.x < hubPadding) {
        hub.x = hubPadding;
        hub.vx = Math.abs(hub.vx) * bounce;
      }
      if (hub.x > width - hubPadding) {
        hub.x = width - hubPadding;
        hub.vx = -Math.abs(hub.vx) * bounce;
      }
      if (hub.y < hubPadding) {
        hub.y = hubPadding;
        hub.vy = Math.abs(hub.vy) * bounce;
      }
      if (hub.y > height - hubPadding) {
        hub.y = height - hubPadding;
        hub.vy = -Math.abs(hub.vy) * bounce;
      }

      const nodes = nodesRef.current;

      for (let index = 0; index < nodes.length; index += 1) {
        const node = nodes[index];

        node.vx += (node.homeX - node.x) * 0.00042 * dt;
        node.vy += (node.homeY - node.y) * 0.00042 * dt;
        node.vx += (Math.random() - 0.5) * 0.014 * dt;
        node.vy += (Math.random() - 0.5) * 0.014 * dt;

        const dx = hub.x - node.x;
        const dy = hub.y - node.y;
        const distance = Math.hypot(dx, dy) || 1;
        const desiredDistance = node.preferredDistance * (isDraggingRef.current ? 0.78 : 1);
        const distanceDelta = distance - desiredDistance;
        const attractionStrength = isDraggingRef.current ? 0.00108 : 0.00012;

        node.vx += (dx / distance) * distanceDelta * attractionStrength * dt;
        node.vy += (dy / distance) * distanceDelta * attractionStrength * dt;

        if (isDraggingRef.current) {
          node.vx += hub.vx * 0.03;
          node.vy += hub.vy * 0.03;
        }
      }

      for (let firstIndex = 0; firstIndex < nodes.length; firstIndex += 1) {
        const firstNode = nodes[firstIndex];

        for (
          let secondIndex = firstIndex + 1;
          secondIndex < nodes.length;
          secondIndex += 1
        ) {
          const secondNode = nodes[secondIndex];
          const dx = secondNode.x - firstNode.x;
          const dy = secondNode.y - firstNode.y;
          const distance = Math.hypot(dx, dy) || 1;
          const minDistance = SPOKE_RADIUS + SPOKE_RADIUS + (mobile ? 94 : 122);

          if (distance < minDistance) {
            const overlap = minDistance - distance;
            const force = overlap * 0.0034 * dt;
            const unitX = dx / distance;
            const unitY = dy / distance;

            firstNode.vx -= unitX * force;
            firstNode.vy -= unitY * force;
            secondNode.vx += unitX * force;
            secondNode.vy += unitY * force;
          }
        }
      }

      for (const node of nodes) {
        for (const zone of resolvedZones) {
          const margin = mobile ? 18 : 24;
          const zoneLeft = zone.x - margin;
          const zoneRight = zone.x + zone.width + margin;
          const zoneTop = zone.y - margin;
          const zoneBottom = zone.y + zone.height + margin;
          const nearestX = clamp(node.x, zoneLeft, zoneRight);
          const nearestY = clamp(node.y, zoneTop, zoneBottom);
          let dx = node.x - nearestX;
          let dy = node.y - nearestY;
          let distance = Math.hypot(dx, dy);

          if (distance === 0) {
            dx = node.x < zone.x + zone.width / 2 ? -1 : 1;
            dy = node.y < zone.y + zone.height / 2 ? -1 : 1;
            distance = 1;
          }

          const threshold = mobile ? 52 : 72;
          if (distance < threshold) {
            const force = (threshold - distance) * 0.0062 * dt;
            node.vx += (dx / distance) * force;
            node.vy += (dy / distance) * force;
          }
        }

        node.vx *= 0.988;
        node.vy *= 0.988;

        const speed = Math.hypot(node.vx, node.vy);
        if (speed > maxNodeSpeed) {
          const scale = maxNodeSpeed / speed;
          node.vx *= scale;
          node.vy *= scale;
        }

        node.x += node.vx * dt;
        node.y += node.vy * dt;

        const safePadding = getNodeSafePadding(node);

        if (node.x < safePadding.left) {
          node.x = safePadding.left;
          node.vx = Math.abs(node.vx) * bounce;
        }
        if (node.x > width - safePadding.right) {
          node.x = width - safePadding.right;
          node.vx = -Math.abs(node.vx) * bounce;
        }
        if (node.y < safePadding.top) {
          node.y = safePadding.top;
          node.vy = Math.abs(node.vy) * bounce;
        }
        if (node.y > height - safePadding.bottom) {
          node.y = height - safePadding.bottom;
          node.vy = -Math.abs(node.vy) * bounce;
        }
      }

      setScene(extractScene(hub, nodes, curveRelaxRef.current, timeRef.current));
      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, [height, mobile, resolvedZones, width]);

  useEffect(() => {
    if (!isProfileOpen) return;

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
      }
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      if (!target) return;
      if (profileCardRef.current?.contains(target)) return;
      if (hubButtonRef.current?.contains(target)) return;
      setIsProfileOpen(false);
    }

    window.addEventListener("keydown", handleKeydown);
    window.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isProfileOpen]);

  useEffect(() => {
    if (!isProfileOpen || !popupPosition) return;

    const measuredWidth = profileCardRef.current?.getBoundingClientRect().width ?? popupDimensions.width;
    const measuredHeight =
      profileCardRef.current?.getBoundingClientRect().height ?? popupDimensions.height;

    setPopupPosition((current) => {
      if (!current) return current;
      const next = clampPopupPosition(
        current,
        width,
        height,
        measuredWidth,
        measuredHeight,
        mobile,
      );

      return next.x === current.x && next.y === current.y ? current : next;
    });
  }, [
    height,
    isProfileOpen,
    mobile,
    popupPosition,
    popupDimensions.height,
    popupDimensions.width,
    width,
  ]);

  function closeProfile() {
    popupDragStateRef.current = null;
    setIsProfileDragging(false);
    setIsProfileOpen(false);
  }

  function toggleProfile() {
    if (isProfileOpen) {
      closeProfile();
      return;
    }

    const hub = hubRef.current;
    const measuredWidth = profileCardRef.current?.getBoundingClientRect().width ?? popupDimensions.width;
    const measuredHeight =
      profileCardRef.current?.getBoundingClientRect().height ?? popupDimensions.height;
    const nextPosition = getInitialPopupPosition(
      hub?.x ?? width * 0.58,
      hub?.y ?? height * 0.5,
      width,
      height,
      measuredWidth,
      measuredHeight,
      mobile,
    );

    setPopupPosition(nextPosition);
    setIsProfileOpen(true);
  }

  function releaseDrag(pointerId?: number) {
    if (!dragStateRef.current) return;
    if (pointerId !== undefined && dragStateRef.current.pointerId !== pointerId) return;

    const shouldToggleProfile = !dragStateRef.current.moved;
    dragStateRef.current = null;
    isDraggingRef.current = false;
    setIsDragging(false);

    if (shouldToggleProfile) {
      toggleProfile();
    }
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!hubRef.current) return;

    const rect = event.currentTarget.getBoundingClientRect();
    dragStateRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      lastClientX: event.clientX,
      lastClientY: event.clientY,
      lastTimestamp: performance.now(),
      startClientX: event.clientX,
      startClientY: event.clientY,
      moved: false,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
    isDraggingRef.current = true;
    setIsDragging(true);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const dragState = dragStateRef.current;
    const hub = hubRef.current;
    const stage = stageRef.current;
    if (!dragState || !hub || !stage || dragState.pointerId !== event.pointerId) return;

    const stageRect = stage.getBoundingClientRect();
    const hubSize = mobile ? 36 : 42;
    const hubPadding = mobile ? 34 : 42;
    const movedDistance = Math.hypot(
      event.clientX - dragState.startClientX,
      event.clientY - dragState.startClientY,
    );
    if (movedDistance > 5) {
      dragState.moved = true;
    }

    const nextX = clamp(
      event.clientX - stageRect.left - dragState.offsetX + hubSize / 2,
      hubPadding,
      stageRect.width - hubPadding,
    );
    const nextY = clamp(
      event.clientY - stageRect.top - dragState.offsetY + hubSize / 2,
      hubPadding,
      stageRect.height - hubPadding,
    );
    const now = performance.now();
    const delta = Math.max(1, now - dragState.lastTimestamp);
    const velocityScale = 16.6667 / delta;

    hub.vx = (event.clientX - dragState.lastClientX) * 0.18 * velocityScale;
    hub.vy = (event.clientY - dragState.lastClientY) * 0.18 * velocityScale;
    hub.x = nextX;
    hub.y = nextY;
    hub.homeX = nextX;
    hub.homeY = nextY;

    dragState.lastClientX = event.clientX;
    dragState.lastClientY = event.clientY;
    dragState.lastTimestamp = now;
  }

  function handlePopupDragStart(event: ReactPointerEvent<HTMLDivElement>) {
    if (!popupPosition) return;

    event.stopPropagation();
    popupDragStateRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - popupPosition.x,
      offsetY: event.clientY - popupPosition.y,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
    setIsProfileDragging(true);
  }

  function handlePopupDragMove(event: ReactPointerEvent<HTMLDivElement>) {
    const dragState = popupDragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    event.stopPropagation();

    const measuredWidth = profileCardRef.current?.getBoundingClientRect().width ?? popupDimensions.width;
    const measuredHeight =
      profileCardRef.current?.getBoundingClientRect().height ?? popupDimensions.height;
    const nextPosition = clampPopupPosition(
      {
        x: event.clientX - dragState.offsetX,
        y: event.clientY - dragState.offsetY,
      },
      width,
      height,
      measuredWidth,
      measuredHeight,
      mobile,
    );

    setPopupPosition(nextPosition);
  }

  function handlePopupDragEnd(pointerId?: number) {
    if (!popupDragStateRef.current) return;
    if (pointerId !== undefined && popupDragStateRef.current.pointerId !== pointerId) return;

    popupDragStateRef.current = null;
    setIsProfileDragging(false);
  }

  const hubSize = mobile ? 36 : 42;
  const hubActive = activeTarget === null || activeTarget === "hub";
  const popupCardWidth = popupDimensions.width;

  return (
    <div ref={stageRef} className="absolute inset-0 z-0 overflow-hidden">
      {scene ? (
        <>
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox={`0 0 ${width} ${height}`}
          >
            {scene.nodes.map((node) => {
              const relatedToHub = activeTarget === "hub";
              const isActive = activeTarget === null || activeTarget === node.id || relatedToHub;
              const dx = node.x - scene.hub.x;
              const dy = node.y - scene.hub.y;
              const length = Math.hypot(dx, dy) || 1;
              const normalX = -dy / length;
              const normalY = dx / length;
              const midX = (scene.hub.x + node.x) / 2;
              const midY = (scene.hub.y + node.y) / 2;
              const drift =
                Math.sin(scene.time * 0.7 + node.curvePhase) * node.curveDrift * scene.curveRelax;
              const curveAmount = node.curveSide * (node.curveStrength * scene.curveRelax + drift);
              const controlX = midX + normalX * curveAmount;
              const controlY = midY + normalY * curveAmount;
              const path = `M ${scene.hub.x} ${scene.hub.y} Q ${controlX} ${controlY} ${node.x} ${node.y}`;

              return (
                <path
                  key={node.id}
                  d={path}
                  fill="none"
                  stroke={
                    activeTarget === node.id || relatedToHub
                      ? "rgba(72,38,29,0.26)"
                      : "rgba(72,38,29,0.15)"
                  }
                  strokeLinecap="round"
                  strokeWidth={activeTarget === node.id || relatedToHub ? 0.72 : 0.56}
                  style={{ opacity: isActive ? 1 : 0.42 }}
                />
              );
            })}
          </svg>

          {scene.nodes.map((node) => {
            const isActive = activeTarget === null || activeTarget === node.id;
            const labelTransform =
              node.labelSide === "left"
                ? "translate(-100%, -50%)"
                : node.labelSide === "right"
                  ? "translate(0, -50%)"
                  : "translate(-50%, 0)";
            const labelLeft =
              node.labelSide === "left"
                ? node.x - SPOKE_RADIUS - 14
                : node.labelSide === "right"
                  ? node.x + SPOKE_RADIUS + 14
                  : node.x;
            const labelTop = node.labelSide === "bottom" ? node.y + SPOKE_RADIUS + 14 : node.y;
            const labelAlign =
              node.labelSide === "left"
                ? "items-end text-right"
                : node.labelSide === "right"
                  ? "items-start text-left"
                  : "items-center text-center";

            return (
              <motion.button
                key={node.id}
                className="absolute z-10"
                onBlur={() => setHoveredNode((current) => (current === node.id ? null : current))}
                onClick={closeProfile}
                onFocus={() => setHoveredNode(node.id)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode((current) => (current === node.id ? null : current))}
                style={{
                  left: node.x - 22,
                  top: node.y - 22,
                  width: 44,
                  height: 44,
                  transform: "translate3d(0, 0, 0)",
                  opacity: isActive ? 1 : 0.4,
                }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                type="button"
                whileHover={{ scale: 1.06 }}
              >
                <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                  <span
                    className="block rounded-full"
                    style={{
                      width: SPOKE_DIAMETER,
                      height: SPOKE_DIAMETER,
                      backgroundColor: node.color,
                    }}
                  />
                </span>
                <span
                  className={`pointer-events-none absolute flex whitespace-pre-line text-[0.68rem] uppercase leading-[1.18] tracking-[0.18em] text-[var(--atlas-chocolate)] sm:text-[0.72rem] ${labelAlign}`}
                  style={{
                    left: labelLeft - (node.x - 22),
                    top: labelTop - (node.y - 22),
                    maxWidth: node.labelWidth,
                    transform: labelTransform,
                  }}
                >
                  {node.label}
                </span>
              </motion.button>
            );
          })}

          <motion.button
            ref={hubButtonRef}
            aria-label="Open Vivian Glenn profile and drag hub"
            className={`absolute z-20 touch-none ${isDragging ? "cursor-grabbing" : activeTarget === "hub" ? "cursor-grab" : "cursor-default"}`}
            onBlur={() => setHoveredNode((current) => (current === "hub" ? null : current))}
            onFocus={() => setHoveredNode("hub")}
            onMouseEnter={() => setHoveredNode("hub")}
            onMouseLeave={() => setHoveredNode((current) => (current === "hub" ? null : current))}
            onPointerCancel={(event) => releaseDrag(event.pointerId)}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={(event) => {
              event.currentTarget.releasePointerCapture(event.pointerId);
              releaseDrag(event.pointerId);
            }}
            style={{
              left: scene.hub.x - hubSize / 2,
              top: scene.hub.y - hubSize / 2,
              width: hubSize,
              height: hubSize,
              transform: "translate3d(0, 0, 0)",
              opacity: hubActive ? 1 : 0.4,
            }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            type="button"
            whileHover={{ scale: 1.03 }}
          >
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="drop-shadow-[0_10px_18px_rgba(72,38,29,0.08)]">
                <HubSun size={hubSize} />
              </span>
              <span className="pointer-events-none absolute left-1/2 top-[calc(100%+0.45rem)] -translate-x-1/2 whitespace-nowrap font-[family-name:var(--font-editorial-serif)] text-[0.72rem] uppercase tracking-[0.15em] text-[var(--atlas-chocolate)] sm:text-[0.76rem]">
                Vivian Glenn
              </span>
            </span>
          </motion.button>

          {isProfileOpen ? (
            <motion.div
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="fixed z-40"
              initial={{ opacity: 0, y: 10, scale: 0.985 }}
              ref={profileCardRef}
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
              style={{
                left: popupPosition?.x ?? getViewportPadding(mobile),
                top: popupPosition?.y ?? getViewportPadding(mobile),
                width: popupCardWidth,
                maxWidth: `calc(100vw - ${getViewportPadding(mobile) * 2}px)`,
              }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <ProfileCard
                dragHandleProps={{
                  onPointerDown: handlePopupDragStart,
                  onPointerMove: handlePopupDragMove,
                  onPointerUp: (event) => {
                    event.currentTarget.releasePointerCapture(event.pointerId);
                    handlePopupDragEnd(event.pointerId);
                  },
                  onPointerCancel: (event) => handlePopupDragEnd(event.pointerId),
                }}
                isDragging={isProfileDragging}
                onClose={closeProfile}
              />
            </motion.div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
