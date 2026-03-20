"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ─── constants ────────────────────────────────────────────────────────────────
const MAX_IRIS_TRAVEL = 22; // px – max drift (at full scale)
const BLINK_INTERVAL_MIN = 2500;
const BLINK_INTERVAL_MAX = 6000;
const BLINK_DURATION = 130; // ms

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

// ─── single eye ───────────────────────────────────────────────────────────────
function Eye({
  offsetX,
  offsetY,
  scale,
}: {
  offsetX: number;
  offsetY: number;
  scale: number;
}) {
  const s = scale;
  const EYE_W = Math.round(220 * s);
  const EYE_H = Math.round(260 * s);
  const IRIS_SIZE = Math.round(130 * s);
  const PUPIL_SIZE = Math.round(70 * s);
  const HIGHLIGHT_SIZE = Math.round(30 * s);
  const maxTravel = MAX_IRIS_TRAVEL * s;

  return (
    <div
      style={{
        position: "relative",
        width: EYE_W,
        height: EYE_H,
        borderRadius: "50%",
        background: "white",
        border: `${Math.max(2, Math.round(5 * s))}px solid #000000ff`,
        boxShadow: "0 4px 24px rgba(222, 222, 222, 0.3)",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* ── iris + pupil, shifted toward cursor ── */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: IRIS_SIZE,
          height: IRIS_SIZE,
          borderRadius: "50%",
          background: "#000000ff",
          transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`,
          transition: "transform 0.06s linear",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* pupil */}
        <div
          style={{
            width: PUPIL_SIZE,
            height: PUPIL_SIZE,
            borderRadius: "50%",
            background: "#ffffffff",
          }}
        />
        {/* highlight – white crescent in top-left */}
        <div
          style={{
            position: "absolute",
            top: Math.round(18 * s),
            left: Math.round(18 * s),
            width: HIGHLIGHT_SIZE,
            height: HIGHLIGHT_SIZE,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 1)",
          }}
        />
        {/* secondary smaller highlight */}
        <div
          style={{
            position: "absolute",
            top: Math.round(38 * s),
            left: Math.round(42 * s),
            width: Math.round(13 * s),
            height: Math.round(13 * s),
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 1)",
          }}
        />
      </div>
    </div>
  );
}

// ─── eyebrow ──────────────────────────────────────────────────────────────────
function Eyebrow({ flip = false, scale }: { flip?: boolean; scale: number }) {
  return (
    <div
      style={{
        width: Math.round(200 * scale),
        height: Math.round(40 * scale),
        background: "#111",
        borderRadius: flip
          ? "50% 50% 30% 30% / 60% 60% 40% 40%"
          : "30% 30% 50% 50% / 40% 40% 60% 60%",
        transform: flip ? "scaleX(-1) rotate(-8deg)" : "rotate(-8deg)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
      }}
    />
  );
}

// ─── main component ───────────────────────────────────────────────────────────
export default function AnimatedEyes() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [blinkScale, setBlinkScale] = useState(1);
  const [scale, setScale] = useState(1);
  const isBlinking = useRef(false);
  const blinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // ── responsive scale ─────────────────────────────────────────────────────
  useEffect(() => {
    function updateScale() {
      // Full size at 600px+; shrink linearly down to 320px where scale = 0.52
      const w = window.innerWidth;
      const s = w >= 600 ? 1 : Math.max(0.52, w / 600);
      setScale(s);
    }
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  // ── cursor tracking ──────────────────────────────────────────────────────
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const travel = MAX_IRIS_TRAVEL * scale;
      const factor = dist === 0 ? 0 : Math.min(travel / dist, 1);
      setOffset({
        x: clamp(dx * factor, -travel, travel),
        y: clamp(dy * factor, -travel, travel),
      });
    },
    [scale],
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  // ── touch tracking (mobile) ──────────────────────────────────────────────
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!wrapperRef.current) return;
      const touch = e.touches[0];
      const rect = wrapperRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = touch.clientX - cx;
      const dy = touch.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const travel = MAX_IRIS_TRAVEL * scale;
      const factor = dist === 0 ? 0 : Math.min(travel / dist, 1);
      setOffset({
        x: clamp(dx * factor, -travel, travel),
        y: clamp(dy * factor, -travel, travel),
      });
    },
    [scale],
  );

  useEffect(() => {
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    return () => window.removeEventListener("touchmove", handleTouchMove);
  }, [handleTouchMove]);

  // ── blinking ─────────────────────────────────────────────────────────────
  const scheduleBlink = useCallback(() => {
    blinkTimer.current = setTimeout(
      () => {
        if (isBlinking.current) return;
        isBlinking.current = true;
        setBlinkScale(0.05);
        setTimeout(() => {
          setBlinkScale(1);
          isBlinking.current = false;
          scheduleBlink();
        }, BLINK_DURATION);
      },
      randomBetween(BLINK_INTERVAL_MIN, BLINK_INTERVAL_MAX),
    );
  }, []);

  useEffect(() => {
    scheduleBlink();
    return () => {
      if (blinkTimer.current) clearTimeout(blinkTimer.current);
    };
  }, [scheduleBlink]);

  return (
    <div
      ref={wrapperRef}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
        userSelect: "none",
      }}
    >
      {/* eyebrows */}
      <div
        style={{
          display: "flex",
          gap: Math.round(60 * scale),
          marginBottom: Math.round(18 * scale),
        }}
      >
        <Eyebrow scale={scale} />
        <Eyebrow flip scale={scale} />
      </div>

      {/* eyes */}
      <div
        style={{
          display: "flex",
          gap: Math.round(60 * scale),
          transform: `scaleY(${blinkScale})`,
          transition: `transform ${BLINK_DURATION * 0.5}ms ease-in-out`,
          transformOrigin: "center center",
        }}
      >
        <Eye offsetX={offset.x} offsetY={offset.y} scale={scale} />
        <Eye offsetX={offset.x} offsetY={offset.y} scale={scale} />
      </div>
    </div>
  );
}
