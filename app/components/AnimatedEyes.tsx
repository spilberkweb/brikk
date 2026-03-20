"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ─── constants ────────────────────────────────────────────────────────────────
const MAX_IRIS_TRAVEL = 22; // px – max drift
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
function Eye({ offsetX, offsetY }: { offsetX: number; offsetY: number }) {
  const EYE_W = 220;
  const EYE_H = 260;
  const IRIS_SIZE = 130;
  const PUPIL_SIZE = 70;
  const HIGHLIGHT_SIZE = 30;

  return (
    <div
      style={{
        position: "relative",
        width: EYE_W,
        height: EYE_H,
        borderRadius: "50%",
        background: "white",
        border: "5px solid #000000ff",
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
            top: 18,
            left: 18,
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
            top: 38,
            left: 42,
            width: 13,
            height: 13,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 1)",
          }}
        />
      </div>
    </div>
  );
}

// ─── eyebrow ──────────────────────────────────────────────────────────────────
function Eyebrow({ flip = false }: { flip?: boolean }) {
  return (
    <div
      style={{
        width: 200,
        height: 40,
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
  const isBlinking = useRef(false);
  const blinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // ── cursor tracking ──────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const scale = dist === 0 ? 0 : Math.min(MAX_IRIS_TRAVEL / dist, 1);
    setOffset({
      x: clamp(dx * scale, -MAX_IRIS_TRAVEL, MAX_IRIS_TRAVEL),
      y: clamp(dy * scale, -MAX_IRIS_TRAVEL, MAX_IRIS_TRAVEL),
    });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

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
          gap: 60,
          marginBottom: 18,
        }}
      >
        <Eyebrow />
        <Eyebrow flip />
      </div>

      {/* eyes */}
      <div
        style={{
          display: "flex",
          gap: 60,
          transform: `scaleY(${blinkScale})`,
          transition: `transform ${BLINK_DURATION * 0.5}ms ease-in-out`,
          transformOrigin: "center center",
        }}
      >
        <Eye offsetX={offset.x} offsetY={offset.y} />
        <Eye offsetX={offset.x} offsetY={offset.y} />
      </div>
    </div>
  );
}
